import type { YooEditor } from '@yoopta/editor';
import { markdown } from '@yoopta/exports';

import { exportToHTML } from '../../../shared';

export type ExportType = 'markdown' | 'html';

interface ExportConfig {
    type: ExportType;
    editor: YooEditor;
    title: string;
}

interface ExportResult {
    content: string;
    mimeType: string;
    fileExtension: string;
}

const prepareExportContent = ({ type, editor, title }: ExportConfig): ExportResult => {
    if (type === 'markdown') {
        return {
            content: markdown.serialize(editor, editor.getEditorValue()),
            mimeType: 'text/markdown',
            fileExtension: 'md',
        };
    } else {
        return {
            content: exportToHTML(editor, title),
            mimeType: 'text/html',
            fileExtension: 'html',
        };
    }
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const exportContent = ({ type, editor, title }: ExportConfig) => {
    const { content, mimeType, fileExtension } = prepareExportContent({ type, editor, title });
    const filename = `${title}.${fileExtension}`;

    downloadFile(content, filename, mimeType);

    return { type, filename };
};
