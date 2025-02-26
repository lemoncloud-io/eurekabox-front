import Accordion from '@yoopta/accordion';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Blockquote from '@yoopta/blockquote';
import Callout from '@yoopta/callout';
import Code from '@yoopta/code';
import Divider from '@yoopta/divider';
import type { YooEditor } from '@yoopta/editor';
import type { YooptaBlockData, YooptaContentValue } from '@yoopta/editor/dist/editor/types';
import Embed from '@yoopta/embed';
import { html } from '@yoopta/exports';
import File from '@yoopta/file';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Image from '@yoopta/image';
import type { LinkElementProps } from '@yoopta/link';
import Link from '@yoopta/link';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import { Bold, CodeMark, Highlight, Italic, Strike, Underline } from '@yoopta/marks';
import Paragraph from '@yoopta/paragraph';
import Table from '@yoopta/table';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import Video from '@yoopta/video';

import { uploadImage } from '@eurekabox/contents';

export interface ElementStructure {
    depth: number;
    id: string;
    name: string;
    text: string;
    no: number;
    elementIds?: string[];
    element$$?: ElementStructure[];
    createdAt?: number;
    deletedAt?: number;
    updatedAt?: number;
    parentId?: string;
    meta?: any;
}

export const plugins = [
    Paragraph,
    Table,
    Divider,
    Accordion,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Link.extend({
        elementProps: {
            link: (props: LinkElementProps) => ({
                ...props,
                target: '_blank',
            }),
        },
    }),
    Embed,
    Image.extend({
        options: {
            async onUpload(file) {
                const data = await uploadImage(file);
                return {
                    src: data?.url,
                    alt: data?.name,
                    sizes: {
                        width: data?.width,
                        height: data?.height,
                    },
                };
            },
        },
    }),
    Video.extend({
        options: {
            onUpload: async file => {
                const data = await uploadImage(file);
                return {
                    src: data?.url,
                    alt: data?.name,
                    sizes: {
                        width: data?.width,
                        height: data?.height,
                    },
                };
            },
            onUploadPoster: async file => {
                const data = await uploadImage(file);
                return data?.url;
            },
        },
    }),
    File,
];

export const TOOLS = {
    ActionMenu: {
        render: DefaultActionMenuRender,
        tool: ActionMenuList,
    },
    Toolbar: {
        render: DefaultToolbarRender,
        tool: Toolbar,
    },
    LinkTool: {
        render: DefaultLinkToolRender,
        tool: LinkTool,
    },
};

export const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

export interface AdjustedDepth {
    id: string;
    depth: number;
    order: number;
}

export const getAllAdjustedDepths = (editorValue: YooptaContentValue, maxDepthDifference = 1): AdjustedDepth[] => {
    const sortedBlocks = Object.values(editorValue).sort((a, b) => a.meta.order - b.meta.order);
    const adjustments: AdjustedDepth[] = [];

    sortedBlocks.forEach((block, index) => {
        if (index === 0) {
            // 첫 번째 블록은 depth가 0이어야 함
            if (block.meta.depth !== 0) {
                adjustments.push({
                    id: block.id,
                    depth: 0,
                    order: block.meta.order,
                });
            }
            return;
        }

        const prevBlock = sortedBlocks[index - 1];
        // 현재 블록의 depth가 이전 블록보다 높을 때만 체크
        if (block.meta.depth > prevBlock.meta.depth) {
            const allowedDepth = prevBlock.meta.depth + maxDepthDifference;

            if (block.meta.depth > allowedDepth) {
                adjustments.push({
                    id: block.id,
                    depth: allowedDepth,
                    order: block.meta.order,
                });
            }
        }
    });

    return adjustments;
};

export const extractContent = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const mainElement = doc.body.firstElementChild;

    if (!mainElement) {
        return '';
    }

    // body의 data-editor-id만 제거
    doc.body.removeAttribute('id');

    // mainElement의 data-meta-* 속성만 제거 (style은 유지)
    mainElement
        .getAttributeNames()
        .filter(name => name.startsWith('data-meta-'))
        .forEach(name => mainElement.removeAttribute(name));

    return mainElement.outerHTML;
};

export const convertElementToEditorValue = (
    editor: YooEditor,
    elements: ElementStructure[] = []
): { value: YooptaContentValue } => {
    const value: YooptaContentValue = {};

    if (!elements || elements.length === 0) {
        return { value };
    }

    // element$$ 탐색 없이 flat하게 변환
    elements
        .filter(element => !element.deletedAt)
        .forEach((element, index) => {
            // HTML -> editor value 변환
            const editorBlocks = html.deserialize(editor, element.text || '');

            // 모든 블록을 처리
            Object.entries(editorBlocks).forEach(([blockId, block]) => {
                value[blockId] = {
                    ...block,
                    meta: {
                        ...block.meta,
                        depth: element.depth || 0,
                        order: index,
                        elementId: element.id,
                    },
                } as YooptaBlockData;
            });
        });

    return { value };
};

export const saveSelection = () => {
    try {
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
            // rangeCount도 체크 추가
            return null;
        }

        const range = domSelection.getRangeAt(0);
        if (!range || !range.startContainer || !range.endContainer) {
            return null;
        }

        return {
            start: range.startOffset,
            end: range.endOffset,
        };
    } catch (error) {
        console.log('Selection save failed:', error);
        return null;
    }
};

export const exportToHTML = (editor: YooEditor, title: string) => {
    const editorValue = editor.getEditorValue();
    const editorHtml = html.serialize(editor, editorValue);

    // 기본 스타일 정의
    const styles = `
        <style>
            /* Base styles */
            body {
                margin: 0;
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.5;
                color: #1a1a1a;
                background-color: #ffffff;
            }

            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {
                body {
                    color: #e5e5e5;
                    background-color: #1a1a1a;
                }
            }

            /* Container styles */
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
            }

            /* Editor content styles */
            .editor-content {
                padding: 100px 200px 100px 80px;
            }

            /* Typography */
            h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
            h2 { font-size: 2rem; font-weight: 600; margin-bottom: 0.875rem; }
            h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }

            p { margin-bottom: 1rem; }

            /* Code blocks */
            pre {
                background-color: #f3f4f6;
                padding: 1rem;
                border-radius: 0.375rem;
                overflow-x: auto;
            }

            code {
                font-family: monospace;
            }

            /* Lists */
            ul, ol {
                padding-left: 2rem;
                margin-bottom: 1rem;
            }

            /* Links */
            a {
                color: #2563eb;
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }

            /* Tables */
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1rem;
            }

            th, td {
                border: 1px solid #e5e7eb;
                padding: 0.75rem;
                text-align: left;
            }

            /* Blockquotes */
            blockquote {
                border-left: 4px solid #e5e7eb;
                margin: 0;
                padding-left: 1rem;
                color: #4b5563;
            }

            /* Images */
            img {
                max-width: 100%;
                height: auto;
                border-radius: 0.375rem;
            }

            /* Custom Yoopta editor styles */
            [data-type="heading-one"] {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
            }

            [data-type="heading-two"] {
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 1.25rem;
            }

            [data-type="heading-three"] {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }

            [data-type="paragraph"] {
                margin-bottom: 1rem;
                line-height: 1.75;
            }

            [data-type="code-block"] {
                background-color: #f3f4f6;
                padding: 1rem;
                border-radius: 0.375rem;
                font-family: monospace;
                white-space: pre-wrap;
                margin-bottom: 1rem;
            }

            /* Add more Yoopta-specific styles here */
        </style>
    `;

    // HTML 문서 생성
    const htmlDocument = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            ${styles}
        </head>
        <body>
            <div class="container">
                <div class="editor-content">
                    <h1>${title}</h1>
                    ${editorHtml}
                </div>
            </div>
        </body>
        </html>
    `;

    return htmlDocument;
};
