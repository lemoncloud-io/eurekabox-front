import type { ContentActivityParam, ContentBody, ElementBody } from '@lemoncloud/lemon-contents-api';

export type CreateContentDTO = ContentBody;

export interface UpdateContentDTO extends Partial<CreateContentDTO> {
    contentId: string;
}

export type CreateElementDTO = ElementBody;

export interface UpdateElementDTO extends Partial<CreateElementDTO> {
    elementId: string;
}

export interface UpdateActivityDTO extends Partial<ContentActivityParam> {
    contentId: string;
}
