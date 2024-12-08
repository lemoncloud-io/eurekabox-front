import { useParams } from 'react-router-dom';
import { EditorLayout } from '../layouts/EditorLayout';
import { useContent } from '@lemonote/contents';
import { Loader } from '@lemonote/shared';
import { useEffect, useState } from 'react';

export const UpdateContentPage = () => {
    const { contentId } = useParams<{ contentId: string }>();
    const [title, setTitle] = useState<string>('Untitled');
    const { data: content, isLoading } = useContent(contentId || '');

    useEffect(() => {
        if (content?.title) {
            setTitle(content.title);
        }
    }, [content]);

    return (
        <EditorLayout title={title} isLoading={isLoading} onTitleChange={setTitle}>
            {isLoading && <Loader />}
            {!!content && <div>{content.name}</div>}
        </EditorLayout>
    );
};
