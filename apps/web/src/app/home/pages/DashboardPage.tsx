import { EditorLayout } from '../layouts/EditorLayout';
import { useState } from 'react';

export const DashboardPage = () => {
    const [title, setTitle] = useState<string>('TODO: Create Dashboard');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle}>
            {/* Create content form/editor */}
            <h1>DASHBOARD</h1>
        </EditorLayout>
    );
};
