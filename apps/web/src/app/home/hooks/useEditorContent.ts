import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from '@eurekabox/lib/hooks/use-toast';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { YooEditor } from '@yoopta/editor';
import { html, markdown } from '@yoopta/exports';

import { createElement, deleteElement, fetchContentById, updateContent, updateElement } from '@eurekabox/contents';

import { convertElementToEditorValue, extractContent } from '../utils';

export interface ElementStructure {
    depth: number;
    id: string;
    name: string;
    text: string;
    no: number;
    elementIds?: string[];
    element$$?: ElementStructure[];
    createdAt?: number;
    deletedAt?: number;
    updatedAt?: number;
    parentId?: string;
    meta?: any;
}

interface ElementTracker {
    [elementId: string]: {
        blockId: string;
        text: string;
        type: string;
        order: number;
        depth: number;
        parentId?: string;
        childIds: string[];
    };
}

export const useEditorContent = (contentId: string | undefined, editor: YooEditor) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const elementTrackerRef = useRef<ElementTracker>({});
    const contentRef = useRef<ContentView>(null);
    const fetchedRef = useRef<string | null>(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        return () => {
            loadingRef.current = false;
            editor.setEditorValue({});
            elementTrackerRef.current = {};
            contentRef.current = null;
        };
    }, [editor]);

    const loadContent = useCallback(
        async (id: string) => {
            // 이미 로딩 중이면 중복 로드 방지
            if (loadingRef.current) {
                return;
            }

            try {
                loadingRef.current = true;
                setLoading(true);
                const content = await fetchContentById(id);
                // unmount됐거나 contentId가 변경됐다면 로드 중단
                if (content.id !== contentId) {
                    return;
                }
                contentRef.current = content;

                const hasNoElement = !content.element$$ || content.element$$?.length === 0;
                const isImported = !!content.readme && hasNoElement;
                if (isImported) {
                    let editorValue = markdown.deserialize(editor, content.readme);
                    const isHTML = content.readme.startsWith('<html') || content.readme.startsWith('<HTML');
                    if (isHTML) {
                        editorValue = html.deserialize(editor, content.readme);
                    }

                    editor.setEditorValue(editorValue);
                    await handleSave(content.title);
                    toast({
                        title: '파일 업로드 성공',
                        description: '파일이 성공적으로 로드되었습니다.',
                    });
                    return;
                }

                // element$$ 변환
                const { value } = convertElementToEditorValue(editor, content.element$$ as ElementStructure[]);

                // elementTrackerRef 초기화
                elementTrackerRef.current = {};
                Object.entries(value).forEach(([blockId, block]) => {
                    const elementId = block.meta.elementId; // "C010.E018" 형태
                    if (elementId) {
                        elementTrackerRef.current[elementId] = {
                            text: html.serialize(editor, { [blockId]: block }),
                            type: block.type,
                            depth: block.meta.depth,
                        };
                    }
                });

                editor.setEditorValue(value);
            } catch (err) {
                console.error('Failed to load content:', err);
                setError(err as Error);
            } finally {
                loadingRef.current = false;
                setLoading(false);
                editor.focus();
            }
        },
        [contentId, editor]
    );

    const handleSave = useCallback(
        async (title: string) => {
            if (!contentId) {
                return;
            }

            try {
                setLoading(true);
                const currentValue = editor.getEditorValue();
                const updatedValue = { ...currentValue };

                // 변경사항 추적을 위한 객체들
                const toCreate: Array<{ blockId: string; block: any }> = [];
                const toUpdate: Array<{ id: string; text: string; type: string; depth: number }> = [];
                const toDelete: string[] = [];

                // 1. 삭제된 블록 찾기
                const currentElementIds = new Set(
                    Object.values(currentValue)
                        .map(block => block.meta.elementId)
                        .filter(Boolean)
                );

                for (const elementId of Object.keys(elementTrackerRef.current)) {
                    if (!currentElementIds.has(elementId)) {
                        toDelete.push(elementId);
                    }
                }

                // 2. 새로운 블록과 변경된 블록 찾기
                for (const [blockId, block] of Object.entries(currentValue)) {
                    const elementId = block.meta.elementId;
                    const serializedHtml = html.serialize(editor, { [blockId]: block });

                    if (!elementId) {
                        // 새로운 블록
                        toCreate.push({ blockId, block });
                    } else {
                        // 기존 블록 - 변경사항 확인
                        const prevElement = elementTrackerRef.current[elementId];
                        if (prevElement) {
                            const currentContent = extractContent(serializedHtml);
                            const prevContent = extractContent(prevElement.text);

                            // 내용이나 depth가 변경된 경우에만 업데이트
                            if (currentContent !== prevContent || block.meta.depth !== prevElement.depth) {
                                toUpdate.push({
                                    id: elementId,
                                    text: serializedHtml,
                                    type: block.type,
                                    depth: block.meta.depth,
                                });
                            }
                        }
                    }
                }

                // 3. 변경사항 적용
                // 3.1 병렬로 변경사항 적용
                const deletePromises = toDelete.map(elementId => deleteElement(elementId));
                const updatePromises = toUpdate.map(update =>
                    updateElement({
                        elementId: update.id,
                        text: update.text,
                        name: update.type,
                        depth: update.depth,
                    })
                );
                const createPromises = toCreate.map(({ block }) =>
                    createElement({
                        contentId,
                        name: block.type,
                        text: html.serialize(editor, { [block.id]: block }),
                        depth: block.meta.depth,
                    })
                );

                // 모든 변경사항을 병렬로 처리
                const [deletedResults, updatedResults, createdResults] = await Promise.all([
                    Promise.all(deletePromises),
                    Promise.all(updatePromises),
                    Promise.all(createPromises),
                ]);

                // 생성된 블록들의 elementId 업데이트
                createdResults.forEach((created, index) => {
                    const { blockId } = toCreate[index];
                    updatedValue[blockId] = {
                        ...currentValue[blockId],
                        meta: {
                            ...currentValue[blockId].meta,
                            elementId: created.id,
                        },
                    };
                });

                // 4. elementIds 업데이트 (실제 순서 변경이 있는 경우에만) && title 변경사항 확인
                const orderedElementIds = Object.entries(updatedValue)
                    .sort(([, a], [, b]) => a.meta.order - b.meta.order)
                    .map(([, block]) => block.meta.elementId)
                    .filter(Boolean);

                const currentIds = contentRef.current.elementIds || [];
                const isElementIdsChanged = JSON.stringify(orderedElementIds) !== JSON.stringify(currentIds);
                const isTitleChanged = title !== contentRef.current.title;

                if (isElementIdsChanged || isTitleChanged) {
                    await updateContent({
                        contentId,
                        readme: markdown.serialize(editor, currentValue),
                        ...(isElementIdsChanged && { elementIds: orderedElementIds }),
                        ...(isTitleChanged && { title }),
                    });
                }

                // 5. 트래커 업데이트
                for (const [blockId, block] of Object.entries(updatedValue)) {
                    const elementId = block.meta.elementId;
                    if (elementId) {
                        elementTrackerRef.current[elementId] = {
                            text: html.serialize(editor, { [blockId]: block }),
                            type: block.type,
                            depth: block.meta.depth,
                        };
                    }
                }

                // 6. 데이터 리로드
                await loadContent(contentId);
            } catch (err) {
                console.error('Save failed:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        },
        [contentId, editor, loadContent]
    );

    useEffect(() => {
        if (!contentId || fetchedRef.current === contentId) return;

        fetchedRef.current = contentId;
        loadContent(contentId);
    }, [contentId, loadContent]);

    return {
        content: contentRef.current,
        loading,
        error,
        handleSave,
    };
};
