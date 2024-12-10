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
