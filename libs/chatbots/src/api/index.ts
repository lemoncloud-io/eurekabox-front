
import type {
    BrainView,
    ChatView,
    DocumentSyncPullParam,
    DocumentSyncPullResult,
    DocumentView,
    EmbeddingView,
    PromptView,
} from '@lemoncloud/ssocio-chatbots-api';

import type { ListResult, Params } from '@eurekabox/shared';
import { webCore } from '@eurekabox/web-core';

import type {
    BulkCreateChildBotsBody,
    CreateChatDTO,
    SendMessageDTO,
    UpdateChatDTO,
    UpdateDocumentDTO,
    UpdatePromptDTO,
} from '../types';

const CHATBOTS_ENDPOINT = import.meta.env.VITE_CHATBOTS_API_ENDPOINT.toLowerCase();

export const fetchRootChats = async (params: Params): Promise<ListResult<ChatView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/chats`,
        })
        .setParams({ stereo: 'root', view: 'admin', ...params })
        .execute<ListResult<ChatView>>();

    return { ...data };
};

export const fetchChatById = async (chatId: string): Promise<ChatView> => {
    if (!chatId) {
        throw new Error('fetchChatById: @chatId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${chatId}`,
        })
        .execute<ChatView>();

    return { ...data };
};

export const createRootChat = async (createBody: CreateChatDTO): Promise<ChatView> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/0`,
        })
        .setBody({ stereo: 'root', ...createBody })
        .execute<ChatView>();

    return response.data;
};

export const fetchChildChats = async (params: Params): Promise<ListResult<ChatView>> => {
    const { rootId, ...data } = params;
    if (!rootId) {
        throw new Error('fetchChildChats: @rootId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${rootId}/child`,
        })
        .setParams({ ...data })
        .execute<ListResult<ChatView>>();

    return response.data;
};

export const createChildChats = async (bulkBody: BulkCreateChildBotsBody): Promise<ListResult<ChatView>> => {
    const { rootId, list } = bulkBody;
    if (!rootId) {
        throw new Error('createChildChats: @rootId is required');
    }
    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${rootId}/child-bulk`,
        })
        .setBody({ list })
        .execute<ListResult<ChatView>>();

    return response.data;
};

export const sendMessage = async (sendMessageDTO: SendMessageDTO): Promise<ListResult<ChatView>> => {
    const { groupId, params = {}, body } = sendMessageDTO;
    if (!groupId) {
        throw new Error('sendMessage: @groupId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${groupId}/chat`,
        })
        .setParams({ ...params })
        .setBody({ ...body })
        .execute<ListResult<ChatView>>();

    return response.data;
};

export const getChatMessage = async (sendMessageDTO: SendMessageDTO): Promise<ChatView> => {
    const { groupId, params = {}, body } = sendMessageDTO;
    if (!groupId) {
        throw new Error('getChatMessage: @groupId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${groupId}/chat`,
        })
        .setParams({ ...params })
        .execute<ChatView>();

    return response.data;
};

export const deleteChat = async (chatbotId: string): Promise<ChatView> => {
    if (!chatbotId) {
        throw new Error('deleteChat: @chatbotId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'DELETE',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${chatbotId}`,
        })
        .setBody({})
        .execute<ChatView>();

    return data;
};

export const updateChat = async (updateBody: UpdateChatDTO): Promise<ChatView> => {
    const { chatId, ...data } = updateBody;
    if (!chatId) {
        throw new Error('updateChat: @chatId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/${chatId}`,
        })
        .setBody(data)
        .execute<ChatView>();

    return response.data;
};

export const updatePrompt = async (updateBody: UpdatePromptDTO): Promise<PromptView> => {
    const { promptId, ...data } = updateBody;
    if (!promptId) {
        throw new Error('updatePrompt: @promptId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts/${promptId}`,
        })
        .setBody(data)
        .execute<PromptView>();

    return response.data;
};

export const fetchEmbeddings = async (params: Params): Promise<ListResult<EmbeddingView>> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/embeddings`,
        })
        .setParams({ stereo: 'system', ...params })
        .execute<ListResult<EmbeddingView>>();

    return response.data;
};

export const fetchBrains = async (params: Params): Promise<ListResult<BrainView>> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/brains`,
        })
        .setParams({ stereo: 'llm', ...params })
        .execute<ListResult<BrainView>>();

    return response.data;
};

export const fetchPrompts = async (params: Params): Promise<ListResult<PromptView>> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts`,
        })
        .setParams({ ...params })
        .execute<ListResult<PromptView>>();

    return response.data;
};

export const fetchDocs = async (params: DocumentSyncPullParam): Promise<DocumentSyncPullResult> => {
    const { type, siteId } = params;

    if (!type || !siteId) {
        throw new Error('fetchDocs: @type or @siteId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/docs/0/sync-pull`,
        })
        .setParams({ save: 1, ...params })
        .execute<DocumentSyncPullResult>();

    return response.data;
};

export const updateDocument = async (updateBody: UpdateDocumentDTO): Promise<DocumentView> => {
    const { resourceId } = updateBody;
    if (!resourceId) {
        throw new Error('updateDocument: @resourceId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/docs/0/save`,
        })
        .setParams({ detail: 1 })
        .setBody(updateBody)
        .execute<DocumentView>();

    return response.data;
};

export const fetchDocumentById = async (docId: string): Promise<DocumentView> => {
    if (!docId) {
        throw new Error('fetchDocumentId: @docId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/docs/${docId}`,
        })
        .execute<DocumentView>();

    return { ...data };
};
