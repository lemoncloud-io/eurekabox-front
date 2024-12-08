import { EditorLayout } from '../layouts/EditorLayout';
import { useState } from 'react';

export const CreateContentPage = () => {
    const [title, setTitle] = useState<string>('Untitled');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle}>
            {/* Create content form/editor */}
        </EditorLayout>
    );
};
