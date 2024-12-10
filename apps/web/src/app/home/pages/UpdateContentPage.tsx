import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { Loader } from '@lemonote/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MARKS, plugins, TOOLS } from '../utils';
import { YooptaContentValue } from '@yoopta/editor/dist/editor/types';
import YooptaEditor, { createYooptaEditor, Tools } from '@yoopta/editor';
import { useEditorContent } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { contentsKeys } from '@lemonote/contents';

export const UpdateContentPage = () => {
    const queryClient = useQueryClient();
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');
    const selectionRef = useRef(null);
    const [value, setValue] = useState<YooptaContentValue>({});
    const editor = useMemo(() => createYooptaEditor(), []);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    const updateContentInInfiniteCache = (contentId: string | undefined, title: string) => {
        if (!contentId) {
            return;
        }
        queryClient.setQueryData(contentsKeys.list({ limit: 10, page: 0 }), (oldData: any) => {
            if (!oldData) {
                return oldData;
            }
            // 모든 페이지를 순회하면서 해당 contentId를 가진 아이템의 title 업데이트
            const newPages = oldData.pages.map(page => ({
                ...page,
                list: page.list.map(item => (item.id === contentId ? { ...item, title } : item)),
            }));

            return {
                ...oldData,
                pages: newPages,
            };
        });
    };

    const handleClickSave = async () => {
        await handleSave(title);
        updateContentInInfiniteCache(contentId, title);
        setTitle(title);
    };

    return (
        <EditorLayout
            title={title}
            isLoading={loading}
            onTitleChange={setTitle}
            handleSave={handleClickSave}
            contentId={contentId}
        >
            <div
                className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center max-w-screen-xl"
                ref={selectionRef}
            >
                <YooptaEditor
                    selectionBoxRoot={selectionRef}
                    editor={editor}
                    plugins={plugins}
                    tools={TOOLS as Partial<Tools>}
                    marks={MARKS}
                    width="100%"
                    value={value}
                    autoFocus={true}
                />
            </div>
        </EditorLayout>
    );
};
