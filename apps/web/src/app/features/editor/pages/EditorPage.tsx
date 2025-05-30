import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import type { Tools, YooEditor } from '@yoopta/editor';
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';

import { Alert, AlertDescription } from '@eurekabox/lib/components/ui/alert';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';

import { MARKS, TOOLS, plugins, saveSelection } from '../../../shared';
import { EditorLayout } from '../components';
import { useEditorContent, usePageLeaveBlocker, useSaveFocusRestoration } from '../hooks';
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

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);
    const { captureFocusState, restoreFocus } = useSaveFocusRestoration(editor, titleInputRef);

    const focusBlockWithOptions = useCallback((editor: YooEditor, blockId: string) => {
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
    }, []);

    useEffect(() => {
        if (error) {
            toast({
                variant: 'destructive',
                title: t('editorPage.error.title'),
                description: `${error.toString()}`,
            });
        }
    }, [error]);

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
        } else {
            setTitle('');
        }
    }, [content]);

    const checkForChanges = useCallback(() => {
        const currentContent = editor.getEditorValue();
        const currentContentStr = JSON.stringify(currentContent);
        return currentContentStr !== lastSavedContentRef.current || title !== content?.title;
    }, [editor, title, content?.title]);

    // 페이지 이탈 방지
    usePageLeaveBlocker(hasChangesRef.current, checkForChanges);

    useEffect(() => {
        setIsLoading(loading);

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
        return () => setIsLoading(false);
    }, [loading, setIsLoading, editor, content]);

    const saveContent = useCallback(async () => {
        if (!hasChangesRef.current || !checkForChanges()) {
            return;
        }

        const focusState = captureFocusState();

        try {
            await handleSave(title);

            const currentContent = editor.getEditorValue();
            lastSavedContentRef.current = JSON.stringify(currentContent);
            hasChangesRef.current = false;

            if (contentId) {
                updateContentInCache(queryClient, contentId, { title });
            }

            toast({
                title: t('editorPage.save.complete'),
                description: t('editorPage.save.success'),
            });

            restoreFocus(focusState, currentContent, focusBlockWithOptions);
        } catch (error) {
            console.error('Save failed:', error);
            toast({
                variant: 'destructive',
                title: t('editorPage.save.failed'),
                description: t('editorPage.save.error'),
            });
        }
    }, [
        handleSave,
        queryClient,
        contentId,
        title,
        editor,
        t,
        checkForChanges,
        captureFocusState,
        restoreFocus,
        focusBlockWithOptions,
    ]);

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                saveContent();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [saveContent]);

    const handleClickSave = useCallback(async () => {
        await saveContent();
    }, [saveContent]);

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

    const handleTitleChange = useCallback((newTitle: string) => {
        setTitle(newTitle);
        hasChangesRef.current = true;
    }, []);

    const handleTitleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                editor.focus();
            }
        },
        [editor]
    );

    return (
        <>
            {error && (
                <Alert variant="destructive" className="fixed top-20 right-4 z-50 w-80">
                    <AlertDescription>
                        {t('editorPage.load.error')}
                        <button onClick={() => window.location.reload()} className="ml-2 underline hover:no-underline">
                            {t('editorPage.load.refresh')}
                        </button>
                    </AlertDescription>
                </Alert>
            )}
            <EditorLayout
                title={title}
                isLoading={loading}
                contentId={contentId}
                content={content}
                handleSave={handleClickSave}
                handleExport={handleClickExport}
            >
                <div className="px-20 py-6 max-sm:px-[50px] w-full flex flex-col justify-center max-w-screen-xl mx-auto">
                    <input
                        type="text"
                        ref={titleInputRef}
                        value={title}
                        onChange={e => handleTitleChange(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full bg-background text-[24px] font-semibold border-none focus:outline-none caret-text-text pb-4"
                        placeholder={t('editorPage.newPage')}
                        maxLength={MAX_TITLE_LENGTH}
                    />
                    <div ref={selectionRef}>
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
                </div>
            </EditorLayout>
        </>
    );
};
