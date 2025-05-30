import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import type { Tools, YooEditor } from '@yoopta/editor';
import { createYooptaEditor } from '@yoopta/editor';

import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';

import { MARKS, TOOLS, plugins, saveSelection } from '../../../shared';
import { EditorLayout, EditorWrapper, ErrorAlert, TitleInput } from '../components';
import {
    useEditorContent,
    useEditorNotifications,
    useKeyboardShortcuts,
    usePageLeaveBlocker,
    useSaveFocusRestoration,
} from '../hooks';
import { exportContent, updateContentInCache } from '../utils';

const MAX_TITLE_LENGTH = 50;

export const EditorPage = () => {
    const { setIsLoading } = useGlobalLoader();
    const queryClient = useQueryClient();
    const { contentId } = useParams<{ contentId: string }>();

    const { t } = useTranslation();

    const [title, setTitle] = useState<string>('');

    const editor = useMemo(() => createYooptaEditor(), []);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const selectionRef = useRef(null);
    const savedSelectionRef = useRef<{ start: number; end: number } | null>(null); // to restore cursor

    // 마지막 저장 시점의 content를 저장
    const lastSavedContentRef = useRef('');
    const hasChangesRef = useRef(false);

    const { notifyLoadError, notifySaveSuccess, notifySaveError } = useEditorNotifications();
    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);
    const { captureFocusState, restoreFocus } = useSaveFocusRestoration(editor, titleInputRef);

    const editorConfig = useMemo(
        () => ({
            plugins,
            tools: TOOLS as Partial<Tools>,
            marks: MARKS,
        }),
        []
    );

    const focusBlockWithOptions = useCallback(
        (editor: YooEditor, blockId: string) => {
            if (!editor || !blockId) {
                console.log('Invalid editor or blockId');
                return;
            }

            const performFocus = () => {
                try {
                    const baseOptions = {
                        waitExecution: true,
                        waitExecutionMs: 0,
                    };

                    const isValidSelection =
                        savedSelectionRef.current &&
                        typeof savedSelectionRef.current.start === 'number' &&
                        typeof savedSelectionRef.current.end === 'number';

                    if (isValidSelection && savedSelectionRef.current!.start === savedSelectionRef.current!.end) {
                        const focusOptions = {
                            ...baseOptions,
                            focusAt: {
                                path: [0],
                                offset: savedSelectionRef.current!.end,
                            },
                        };
                        editor.focusBlock(blockId, focusOptions);
                    } else {
                        editor.focusBlock(blockId, baseOptions);
                    }
                } catch (innerError) {
                    console.log('Focus block failed in timeout:', innerError);
                    editor.focus();
                } finally {
                    savedSelectionRef.current = null;
                }
            };

            try {
                setTimeout(performFocus, 0);
            } catch (error) {
                console.log('Focus block failed:', error);
                editor.focus();
            }
        },
        [savedSelectionRef]
    );

    useEffect(() => {
        if (error) {
            notifyLoadError(error);
        }
    }, [error, notifyLoadError]);

    // 컨텐츠가 처음 로드될 때 lastSavedContent 초기화
    useEffect(() => {
        if (!content) {
            setTitle('');
            return;
        }
        setTitle(content.title || '');
        // 저장 상태 초기화
        const currentContent = editor.getEditorValue();
        lastSavedContentRef.current = JSON.stringify(currentContent);
        hasChangesRef.current = false;
    }, [content, editor]);

    const checkForChanges = useCallback(() => {
        const currentContent = editor.getEditorValue();
        const currentContentStr = JSON.stringify(currentContent);
        return currentContentStr !== lastSavedContentRef.current || title !== content?.title;
    }, [editor, title, content?.title]);

    // 페이지 이탈 방지
    usePageLeaveBlocker(hasChangesRef.current, checkForChanges);

    useEffect(() => {
        setIsLoading(loading);
        return () => setIsLoading(false);
    }, [loading, setIsLoading]);

    useEffect(() => {
        if (loading) {
            savedSelectionRef.current = saveSelection();
            editor.blur();
        } else {
            // 초기 로드 시에만 포커스 처리
            if (titleInputRef.current && (!content?.title || !content?.element$$?.length)) {
                titleInputRef.current.focus();
                titleInputRef.current.select();
            } else {
                editor.focus();
            }
        }
    }, [loading, editor, content?.title, content?.element$$?.length]);

    const prepareSave = useCallback(() => {
        if (!hasChangesRef.current || !checkForChanges()) {
            return null;
        }

        const focusState = captureFocusState();
        return { focusState };
    }, [checkForChanges, captureFocusState]);

    const updateLocalState = useCallback(() => {
        const currentContent = editor.getEditorValue();
        lastSavedContentRef.current = JSON.stringify(currentContent);
        hasChangesRef.current = false;
        return currentContent;
    }, [editor]);

    const updateUI = useCallback(
        (currentContent: any, focusState: any) => {
            if (contentId) {
                updateContentInCache(queryClient, contentId, { title });
            }
            notifySaveSuccess(title);
            restoreFocus(focusState, currentContent, focusBlockWithOptions);
        },
        [contentId, title, notifySaveSuccess, restoreFocus]
    );

    const handleSaveError = useCallback(
        (error: unknown) => {
            notifySaveError(error);
        },
        [notifySaveError]
    );

    const saveContent = useCallback(async () => {
        const saveContext = prepareSave();
        if (!saveContext) return;

        const { focusState } = saveContext;

        try {
            await handleSave(title);
            const currentContent = updateLocalState();
            updateUI(currentContent, focusState);
        } catch (error) {
            handleSaveError(error);
        }
    }, [prepareSave, handleSave, title, updateLocalState, updateUI, handleSaveError]);

    // 에디터 변경 감지는 항상 동작하도록
    useEffect(() => {
        const handleEditorChange = () => {
            hasChangesRef.current = true;
        };

        editor.on('change', handleEditorChange);
        return () => {
            editor.off('change', handleEditorChange);
        };
    }, [editor]);

    useKeyboardShortcuts([{ key: 's', ctrlOrMeta: true, handler: saveContent }]);

    const titleHandlers = useMemo(
        () => ({
            onChange: (newTitle: string) => {
                setTitle(newTitle);
                hasChangesRef.current = true;
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    editor.focus();
                }
            },
        }),
        [editor]
    );

    const handleClickExport = useCallback(
        async (type: 'markdown' | 'html') => {
            try {
                const { filename } = exportContent({ type, editor, title });

                toast({
                    title: t('editorPage.export.complete'),
                    description: t(`editorPage.export.${type}`),
                });
            } catch (error) {
                console.error('Export failed:', error);
                toast({
                    variant: 'destructive',
                    title: t('editorPage.export.failed'),
                    description: `${error.toString()}`,
                });
            }
        },
        [title, editor, t]
    );

    const actionHandlers = useMemo(
        () => ({
            save: saveContent,
            export: handleClickExport,
        }),
        [saveContent, handleClickExport]
    );

    return (
        <>
            <ErrorAlert
                error={error}
                errorMessage={t('editorPage.load.error')}
                retryLabel={t('editorPage.load.refresh')}
            />
            <EditorLayout
                title={title}
                isLoading={loading}
                contentId={contentId}
                content={content}
                handleSave={actionHandlers.save}
                handleExport={actionHandlers.export}
            >
                <div className="px-20 py-6 max-sm:px-[50px] w-full flex flex-col justify-center max-w-screen-xl mx-auto">
                    <TitleInput
                        ref={titleInputRef}
                        value={title}
                        onChange={titleHandlers.onChange}
                        onKeyDown={titleHandlers.onKeyDown}
                        placeholder={t('editorPage.newPage')}
                        maxLength={MAX_TITLE_LENGTH}
                    />
                    <EditorWrapper ref={selectionRef} editor={editor} config={editorConfig} />
                </div>
            </EditorLayout>
        </>
    );
};
