export interface SaveSelection {
    start: number;
    end: number;
}

export interface BlockMeta {
    elementId?: string;
    depth: number;
    order: number;
}

export interface EditorBlock {
    id: string;
    type: string;
    meta: BlockMeta;
    [key: string]: any;
}

export interface EditorValue {
    [blockId: string]: EditorBlock;
}

export interface ElementTracker {
    [elementId: string]: {
        blockId?: string;
        text: string;
        type: string;
        order?: number;
        depth: number;
        parentId?: string;
        childIds?: string[];
    };
}

export interface ContentOperationItem {
    blockId: string;
    block: EditorBlock;
}

export interface UpdateItem {
    id: string;
    text: string;
    type: string;
    depth: number;
}
