interface ContentEditorProps {
    initialData?: ContentFormData;
    onSubmit?: (data: ContentFormData) => Promise<void>;
    onTitleChange: (title: string) => void;
}

export const ContentEditor = ({ initialData, onSubmit, onTitleChange }: ContentEditorProps) => {
    const handleTitleChange = (value: string) => {
        updateField('title', value);
        onTitleChange(value);
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                value={formData.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="hidden"
                aria-hidden
            />
            {/* 여기에 body editor 구현 */}
            <textarea
                value={formData.body}
                onChange={e => updateField('body', e.target.value)}
                className="w-full h-64 p-4 rounded-md border"
            />
        </div>
    );
};
