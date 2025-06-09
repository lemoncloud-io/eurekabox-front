import { forwardRef } from 'react';

import type { Tools, YooEditor } from '@yoopta/editor';
import YooptaEditor from '@yoopta/editor';

interface EditorConfig {
    plugins: any[];
    tools: Partial<Tools>;
    marks: any[];
}

interface EditorWrapperProps {
    editor: YooEditor;
    config: EditorConfig;
    width?: string;
    autoFocus?: boolean;
    className?: string;
}

export const EditorWrapper = forwardRef<HTMLDivElement, EditorWrapperProps>(
    ({ editor, config, width = '100%', autoFocus = true, className = '' }, ref) => {
        const { plugins, tools, marks } = config;

        return (
            <div ref={ref} className={className}>
                <YooptaEditor
                    selectionBoxRoot={ref}
                    editor={editor}
                    plugins={plugins}
                    tools={tools}
                    marks={marks}
                    width={width}
                    autoFocus={autoFocus}
                />
            </div>
        );
    }
);

EditorWrapper.displayName = 'EditorWrapper';
