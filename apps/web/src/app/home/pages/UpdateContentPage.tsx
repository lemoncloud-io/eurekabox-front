import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MARKS, plugins, TOOLS } from '../utils';
import YooptaEditor, { createYooptaEditor, Tools } from '@yoopta/editor';
import { useEditorContent } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { contentsKeys } from '@lemonote/contents';
import { useGlobalLoader } from '@lemonote/shared';
import debounce from 'lodash/debounce';
import { AutoSaveToggle } from '../components';

export const UpdateContentPage = () => {
    const { setIsLoading } = useGlobalLoader();
    const queryClient = useQueryClient();
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');
    const [autoSave, setAutoSave] = useState(true);

    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);

    // 마지막 저장 시점의 content를 저장
    const lastSavedContentRef = useRef('');
    const hasChangesRef = useRef(false);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    // 컨텐츠가 처음 로드될 때 lastSavedContent 초기화
    useEffect(() => {
        if (content) {
            const currentContent = editor.getEditorValue();
            lastSavedContentRef.current = JSON.stringify(currentContent);
            hasChangesRef.current = false;
        }
    }, [content, editor]);

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    useEffect(() => {
        setIsLoading(loading);
        return () => setIsLoading(false);
    }, [loading, setIsLoading]);

    const focusBlockWithOptions = (editor, blockId, savedSelection) => {
        const baseOptions = {
            waitExecution: true,
            waitExecutionMs: 0,
        };
        const focusOptions =
            savedSelection?.start === savedSelection?.end
                ? {
                      ...baseOptions,
                      focusAt: {
                          path: [0],
                          offset: savedSelection?.end ?? 0,
                      },
                  }
                : baseOptions;
        editor.focusBlock(blockId, focusOptions);
    };

    // 현재 content와 마지막 저장된 content를 비교하는 함수
    const checkForChanges = useCallback(() => {
        const currentContent = editor.getEditorValue();
        const currentContentStr = JSON.stringify(currentContent);
        return currentContentStr !== lastSavedContentRef.current;
    }, [editor]);

    const saveContent = useCallback(async () => {
        if (!hasChangesRef.current || !checkForChanges()) {
            return;
        }
        // 현재 path 저장
        const currentPath = editor.path;
        let savedSelection;
        try {
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                savedSelection = {
                    start: range.startOffset,
                    end: range.endOffset,
                };
            }
        } catch (error) {
            console.log('Selection save failed:', error);
        }

        // 저장 후 현재 상태를 저장
        await handleSave(title);

        const currentContent = editor.getEditorValue();
        lastSavedContentRef.current = JSON.stringify(currentContent);
        hasChangesRef.current = false;

        if (contentId) {
            queryClient.setQueryData(contentsKeys.list({ limit: 10, page: 0 }), (oldData: any) => {
                if (!oldData) {
                    return oldData;
                }
                const newPages = oldData.pages.map(page => ({
                    ...page,
                    list: page.list.map(item => (item.id === contentId ? { ...item, title } : item)),
                }));

                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        }

        setTitle(title);

        // 저장 완료 후 이전 path로 복원
        if (currentPath.current !== null) {
            const previousBlock = Object.entries(currentContent)[currentPath.current];
            const blockId = previousBlock[0];
            focusBlockWithOptions(editor, blockId, savedSelection);
        }
    }, [handleSave, queryClient, contentId, title, editor, checkForChanges]);

    const debouncedSave = useMemo(
        () =>
            debounce(() => {
                if (hasChangesRef.current && checkForChanges()) {
                    saveContent();
                }
            }, 3 * 1000), // 마지막 변경 후 3초가 지나면 자동 저장
        [saveContent, checkForChanges]
    );

    const handleClickSave = useCallback(async () => {
        debouncedSave.cancel();
        await saveContent();
    }, [debouncedSave, saveContent]);

    useEffect(() => {
        if (!autoSave) {
            return;
        }
        const handleEditorChange = () => {
            if (checkForChanges()) {
                hasChangesRef.current = true;
                debouncedSave();
            }
        };
        editor.on('change', handleEditorChange);
        return () => {
            editor.off('change', handleEditorChange);
            debouncedSave.cancel();
        };
    }, [editor, debouncedSave, autoSave, checkForChanges]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleClickSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClickSave]);

    return (
        <>
            <AutoSaveToggle checked={autoSave} onCheckedChange={setAutoSave} />
            <EditorLayout
                title={title}
                isLoading={loading}
                onTitleChange={newTitle => {
                    setTitle(newTitle);
                    hasChangesRef.current = true;
                    debouncedSave();
                }}
                handleSave={handleClickSave}
                contentId={contentId}
            >
                <div
                    className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[50px] pb-[40px] flex justify-center max-w-screen-xl"
                    ref={selectionRef}
                >
                    <YooptaEditor
                        selectionBoxRoot={selectionRef}
                        editor={editor}
                        plugins={plugins}
                        tools={TOOLS as Partial<Tools>}
                        marks={MARKS}
                        width="100%"
                        autoFocus={true}
                    />
                </div>
            </EditorLayout>
        </>
    );
};
