import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MARKS, plugins, TOOLS } from '../utils';
import YooptaEditor, { createYooptaEditor, Tools } from '@yoopta/editor';
import { useEditorContent } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { contentsKeys } from '@lemonote/contents';
import { useGlobalLoader } from '@lemonote/shared';

export const UpdateContentPage = () => {
    const { setIsLoading } = useGlobalLoader();
    const queryClient = useQueryClient();
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');

    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    useEffect(() => {
        setIsLoading(loading);
        return () => setIsLoading(false);
    }, [loading, setIsLoading]);

    const handleClickSave = useCallback(async () => {
        await handleSave(title);

        // updateContentInInfiniteCache
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
    }, [handleSave, queryClient, contentId, title]);

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
        <EditorLayout
            title={title}
            isLoading={loading}
            onTitleChange={setTitle}
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
    );
};
