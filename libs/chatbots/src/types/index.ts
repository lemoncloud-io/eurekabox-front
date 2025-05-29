import type { ChatBody, ChatParam, DocumentBody, PromptBody, RagChatBody } from '@lemoncloud/ssocio-chatbots-api';

export type CreateChatDTO = ChatBody;

export type UpdateRootChatDTO = {
    rootId: string;
} & Partial<ChatBody>;

export type UpdateChatDTO = {
    chatId: string;
} & Partial<ChatBody>;

export type UpdatePromptDTO = {
    promptId: string;
} & Partial<PromptBody>;

export interface BulkCreateChildBotsBody {
    rootId: string;
    list: ChatBody[];
}

export interface SendMessageDTO {
    params?: ChatParam;
    groupId: string;
    body: RagChatBody;
}

export type UpdateDocumentDTO = Partial<DocumentBody>;
