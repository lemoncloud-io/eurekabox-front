import { useEffect, useMemo, useRef, useState } from 'react';

import { useEditorContent } from '../hooks';

import Accordion from '@yoopta/accordion';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Blockquote from '@yoopta/blockquote';
import Callout from '@yoopta/callout';
import Code from '@yoopta/code';
import Divider from '@yoopta/divider';
import YooptaEditor, { createYooptaEditor, Tools } from '@yoopta/editor';
import { YooptaContentValue } from '@yoopta/editor/dist/editor/types';
import Embed from '@yoopta/embed';
import File from '@yoopta/file';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Image from '@yoopta/image';
import Link from '@yoopta/link';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import { Bold, CodeMark, Highlight, Italic, Strike, Underline } from '@yoopta/marks';
import Paragraph from '@yoopta/paragraph';
import Table from '@yoopta/table';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import Video from '@yoopta/video';

import { uploadImage } from '@lemonote/contents';
import { Loader } from '@lemonote/shared';

const plugins = [
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
    Link,
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

const TOOLS = {
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

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

interface AdjustedDepth {
    id: string;
    depth: number;
    order: number;
}

const getAllAdjustedDepths = (editorValue: YooptaContentValue, maxDepthDifference = 1): AdjustedDepth[] => {
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

export const ContentEditor = ({ contentId = '' }) => {
    const selectionRef = useRef(null);
    const [value, setValue] = useState<YooptaContentValue>({});
    const editor = useMemo(() => createYooptaEditor(), []);

    const { content, loading, error, handleSave } = useEditorContent(contentId, editor);

    const onChange = (updated: any, options: any) => {
        // console.log(value, updated, options);
        setValue(updated);
    };

    useEffect(() => {
        // const data = getAllAdjustedDepths(value);
        // if (data.length > 0) {
        //     data.forEach(item => {
        //         editor.decreaseBlockDepth({ blockId: item.id, at: item.order });
        //     });
        // }
    }, [value]);

    return (
        <div
            className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center"
            ref={selectionRef}
        >
            <YooptaEditor
                selectionBoxRoot={selectionRef}
                editor={editor}
                plugins={plugins}
                tools={TOOLS as Partial<Tools>}
                marks={MARKS}
                width="100%"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};
