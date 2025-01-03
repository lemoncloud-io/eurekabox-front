import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, AlertDescription } from '@eurekabox/lib/components/ui/alert';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import YooptaEditor, { Tools, YooEditor, createYooptaEditor } from '@yoopta/editor';
import { markdown } from '@yoopta/exports';

import { contentsKeys } from '@eurekabox/contents';
import { useGlobalLoader } from '@eurekabox/shared';

import { useEditorContent, usePageLeaveBlocker } from '../hooks';
import { EditorLayout } from '../layouts/EditorLayout';
import { MARKS, TOOLS, exportToHTML, plugins, saveSelection } from '../utils';

export const UpdateContentPage = () => {
    const { setIsLoading } = useGlobalLoader();
    const queryClient = useQueryClient();
    const { contentId } = useParams<{ contentId: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState<string>('Untitled');

    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const savedSelectionRef = useRef<{ start: number; end: number } | null>(null); // to restore cursor

    // 마지막 저장 시점의 content를 저장
    const lastSavedContentRef = useRef('');
    const hasChangesRef = useRef(false);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    const focusBlockWithOptions = useCallback((editor: YooEditor, blockId: string) => {
        if (!editor || !blockId) {
            console.log('Invalid editor or blockId');
            return;
        }

        const baseOptions = {
            waitExecution: true,
            waitExecutionMs: 0,
        };

        // selection이 유효한지 한번 더 체크
        const isValidSelection =
            savedSelectionRef.current &&
            typeof savedSelectionRef.current?.start === 'number' &&
            typeof savedSelectionRef.current?.end === 'number';

        console.log(savedSelectionRef.current);

        const focusOptions =
            isValidSelection && savedSelectionRef.current?.start === savedSelectionRef.current?.end
                ? {
                      ...baseOptions,
                      focusAt: {
                          path: [0],
                          offset: savedSelectionRef.current?.end,
                      },
                  }
                : baseOptions;

        try {
            editor.focusBlock(blockId, focusOptions);
        } catch (error) {
            console.log('Focus block failed:', error);
            // fallback: 기본 옵션으로 다시 시도
            editor.focusBlock(blockId, baseOptions);
        } finally {
            savedSelectionRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (error) {
            toast({
                variant: 'destructive',
                title: 'ERROR',
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
            const currentContent = editor.getEditorValue();
            const currentPath = editor.path;

            if (currentPath.current !== null) {
                const previousBlock = Object.entries(currentContent)[currentPath.current];
                if (!previousBlock || previousBlock.length === 0) {
                    return;
                }
                const blockId = previousBlock[0];
                focusBlockWithOptions(editor, blockId);
            }
        }

        return () => setIsLoading(false);
    }, [loading, setIsLoading, editor, focusBlockWithOptions]);

    const saveContent = useCallback(async () => {
        if (!hasChangesRef.current || !checkForChanges()) {
            return;
        }

        const currentPath = editor.path;
        savedSelectionRef.current = saveSelection();

        try {
            await handleSave(title);

            const currentContent = editor.getEditorValue();
            lastSavedContentRef.current = JSON.stringify(currentContent);
            hasChangesRef.current = false;

            if (contentId) {
                queryClient.setQueryData(contentsKeys.list({ limit: 50, page: 0 }), (oldData: any) => {
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

            toast({
                title: '저장 완료',
                description: '문서가 성공적으로 저장되었습니다.',
            });

            // 저장 완료 후 이전 path로 복원
            if (currentPath.current !== null) {
                const previousBlock = Object.entries(currentContent)[currentPath.current];
                if (!previousBlock || previousBlock.length === 0) {
                    return;
                }
                const blockId = previousBlock[0];
                focusBlockWithOptions(editor, blockId);
            }
        } catch (error) {
            console.error('Save failed:', error);
            toast({
                variant: 'destructive',
                title: '저장 실패',
                description: '문서 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
            });
        }
    }, [handleSave, queryClient, contentId, title, editor]);

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
                let content: string;
                let mimeType: string;
                let fileExtension: string;

                if (type === 'markdown') {
                    content = markdown.serialize(editor, editor.getEditorValue());
                    mimeType = 'text/markdown';
                    fileExtension = 'md';
                } else {
                    content = exportToHTML(editor, title);
                    mimeType = 'text/html';
                    fileExtension = 'html';
                }

                const blob = new Blob([content], { type: mimeType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${title}.${fileExtension}`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast({
                    title: '내보내기 완료',
                    description: `${type === 'markdown' ? 'Markdown' : 'HTML'} 파일이 생성되었습니다.`,
                });
            } catch (error) {
                console.error('Export failed:', error);
                toast({
                    variant: 'destructive',
                    title: '내보내기 실패',
                    description: `${error.toString()}`,
                });
            }
        },
        [title, editor]
    );

    const handleTitleChange = useCallback((newTitle: string) => {
        setTitle(newTitle);
        hasChangesRef.current = true;
    }, []);

    useEffect(() => {
        setIsLoading(loading);
        return () => setIsLoading(false);
    }, [loading, setIsLoading]);

    return (
        <>
            {error && (
                <Alert variant="destructive" className="fixed top-20 right-4 z-50 w-80">
                    <AlertDescription>
                        문서를 불러오는 중 오류가 발생했습니다.
                        <button onClick={() => window.location.reload()} className="ml-2 underline hover:no-underline">
                            새로고침
                        </button>
                    </AlertDescription>
                </Alert>
            )}
            <EditorLayout
                title={title}
                isLoading={loading}
                onTitleChange={handleTitleChange}
                contentId={contentId}
                handleSave={handleClickSave}
                handleExport={handleClickExport}
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
