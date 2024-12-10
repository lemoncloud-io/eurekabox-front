import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { Loader } from '@lemonote/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MARKS, plugins, TOOLS } from '../utils';
import { YooptaContentValue } from '@yoopta/editor/dist/editor/types';
import YooptaEditor, { createYooptaEditor, Tools } from '@yoopta/editor';
import { useEditorContent } from '../hooks';

export const UpdateContentPage = () => {
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');
    const selectionRef = useRef(null);
    const [value, setValue] = useState<YooptaContentValue>({});
    const editor = useMemo(() => createYooptaEditor(), []);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    const onChange = (updated: any, options: any) => {
        setValue(updated);
    };

    const handleClickSave = async () => {
        console.log('title', title);
        await handleSave(title);
    };

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    return (
        <EditorLayout title={title} isLoading={loading} onTitleChange={setTitle} handleSave={handleClickSave}>
            {loading && <Loader />}
            <div
                className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center"
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
                    onChange={onChange}
                />
            </div>
        </EditorLayout>
    );
};
