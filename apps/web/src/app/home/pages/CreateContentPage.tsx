import { EditorLayout } from '../layouts/EditorLayout';
import { useState } from 'react';
import { Loader } from '@lemonote/shared';
import { ContentEditor } from '../components';

export const CreateContentPage = () => {
    const [title, setTitle] = useState<string>('Untitled');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle}>
            {<ContentEditor contentId={contentId} />}
        </EditorLayout>
    );
};
