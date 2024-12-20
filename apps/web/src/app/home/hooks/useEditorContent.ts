import { useCallback, useEffect, useRef, useState } from 'react';

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

    const loadContent = useCallback(
        async (id: string) => {
            try {
                setLoading(true);
                const content = await fetchContentById(id);
                contentRef.current = content;

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
                editor.focus();
                setLoading(false);
            }
        },
        [editor]
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
                        console.log('prevElement', elementId, elementTrackerRef.current, prevElement);
                        if (prevElement) {
                            console.log(serializedHtml);
                            console.log(prevElement.text);
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
                // 3.1. 삭제
                for (const elementId of toDelete) {
                    await deleteElement(elementId);
                    delete elementTrackerRef.current[elementId];
                }

                // 3.2. 생성
                for (const { blockId, block } of toCreate) {
                    const created = await createElement({
                        contentId,
                        name: block.type,
                        text: html.serialize(editor, { [blockId]: block }),
                        depth: block.meta.depth,
                    });

                    updatedValue[blockId] = {
                        ...block,
                        meta: {
                            ...block.meta,
                            elementId: created.id,
                        },
                    };
                }

                console.log('toUpdate', toUpdate);
                // 3.3. 업데이트
                for (const update of toUpdate) {
                    await updateElement({
                        elementId: update.id,
                        text: update.text,
                        name: update.type,
                        depth: update.depth,
                    });
                }

                // 4. elementIds 업데이트 (실제 순서 변경이 있는 경우에만) && title 변경사항 확인
                const orderedElementIds = Object.entries(updatedValue)
                    .sort(([, a], [, b]) => a.meta.order - b.meta.order)
                    .map(([, block]) => block.meta.elementId)
                    .filter(Boolean);

                const currentIds = contentRef.current.elementIds || [];
                const isElementIdsChanged = JSON.stringify(orderedElementIds) !== JSON.stringify(currentIds);
                const isTitleChanged = title !== contentRef.current.title;
                await updateContent({
                    contentId,
                    readme: markdown.serialize(editor, currentValue),
                    ...(isElementIdsChanged && { elementIds: orderedElementIds }),
                    ...(isTitleChanged && { title }),
                });

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
