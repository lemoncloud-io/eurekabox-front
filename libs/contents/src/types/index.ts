import type { ContentActivityParam, ContentBody, ElementBody } from '@lemoncloud/eureka-contents-api';

export type CreateContentDTO = ContentBody;

export interface CreateChildContentDTO extends Partial<CreateContentDTO> {
    parentId: string;
}

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
