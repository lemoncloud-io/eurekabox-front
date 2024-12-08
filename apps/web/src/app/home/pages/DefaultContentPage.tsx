import { EditorLayout } from '../layouts/EditorLayout';
import { useState } from 'react';

export const DefaultContentPage = () => {
    const [title, setTitle] = useState<string>('TODO: default');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle}>
            {/* Create content form/editor */}
        </EditorLayout>
    );
};
