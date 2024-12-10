import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { useContent } from '@lemonote/contents';
import { Loader } from '@lemonote/shared';
import { useEffect, useState } from 'react';
import { ContentEditor } from '../components';

export const UpdateContentPage = () => {
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');
    const { data: content, isLoading } = useContent(contentId || '');

    const handleSave = () => {
        console.log('123');
    };

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    return (
        <EditorLayout title={title} isLoading={isLoading} onTitleChange={setTitle} handleSave={handleSave}>
            {isLoading && <Loader />}
            {!!content && <ContentEditor contentId={contentId} />}
        </EditorLayout>
    );
};
