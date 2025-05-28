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

export const startMyChat = async (createBody: CreateChatDTO): Promise<ChatView> => {
    // return {
    //     "id": "1000016",
    //     "createdAt": 1748414693030,
    //     "updatedAt": 1748414693030,
    //     "deletedAt": 0,
    //     "name": "user chat",
    //     "stereo": "root",
    //     "role": "user",
    //     "strategy": "md3",
    //     "agentId": "1000001",
    //     "agent$": {
    //         "id": "1000001"
    //     },
    //     "brainId": "1000003",
    //     "brain$": {
    //         "id": "1000003",
    //         "name": "gpt-4-turbo",
    //         "stereo": "llm",
    //         "model": "gpt-4-turbo"
    //     },
    //     "promptId": "1000003",
    //     "prompt$": {
    //         "id": "1000003",
    //         "name": "prompt3",
    //         "stereo": "system"
    //     },
    //     "userPromptId": "1000004",
    //     "userPrompt$": {
    //         "id": "1000004",
    //         "name": "prompt1",
    //         "stereo": "user"
    //     },
    //     "embeddingId": "lg3",
    //     "embedding$": {
    //         "id": "lg3",
    //         "name": "text-embedding-3-large",
    //         "model": "lg3"
    //     },
    //     "profile$": {
    //         "sid": "T0000277",
    //         "uid": "T1000049",
    //         "dong": "101동",
    //         "ho": "101",
    //         "gender": "female",
    //         "name": "루이세대주"
    //     }
    // } as ChatView;

    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/agents/1000001/start`,
        })
        .setBody({ ...createBody })
        .execute<ChatView>();

    return response.data;
};

export const fetchMyChats = async (params: Params): Promise<ListResult<ChatView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/chats/0/list`,
        })
        .setParams({ stereo: 'root', view: 'mine', name: '!', ...params })
        .execute<ListResult<ChatView>>();

    return { ...data };
};

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
