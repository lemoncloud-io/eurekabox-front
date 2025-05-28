import { useQuery } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import type {
    BrainView,
    ChatView,
    DocumentSyncPullParam,
    DocumentSyncPullResult,
    DocumentView,
    EmbeddingView,
    PromptView,
} from '@lemoncloud/ssocio-chatbots-api';

import { toast } from '@eurekabox/lib/hooks/use-toast';
import { createQueryKeys, useCustomMutation } from '@eurekabox/shared';
import type { PaginationType, Params } from '@eurekabox/shared';

import {
    createChildChats,
    createRootChat,
    deleteChat,
    fetchBrains,
    fetchChatById,
    fetchChildChats,
    fetchDocs,
    fetchDocumentById,
    fetchEmbeddings,
    fetchMyChats,
    fetchPrompts,
    fetchRootChats,
    sendMessage,
    startMyChat,
    updateChat,
    updateDocument,
    updatePrompt,
} from '../api';
import type {
    BulkCreateChildBotsBody,
    CreateChatDTO,
    SendMessageDTO,
    UpdateChatDTO,
    UpdateDocumentDTO,
    UpdatePromptDTO,
} from '../types';
import { generateUUID } from '../utils';

export const myChatbotKeys = createQueryKeys('myChatbotKeys');
export const rootChatbotsKeys = createQueryKeys('rootChatbots');
export const chatbotsKeys = createQueryKeys('chatbots');
export const chatKeys = createQueryKeys('chatKeys');

export const strategyKeys = createQueryKeys('strategies');
export const embeddingKeys = createQueryKeys('embeddings');
export const brainKeys = createQueryKeys('brains');
export const promptKeys = createQueryKeys('prompts');
export const docsKeys = createQueryKeys('docs');

export const MY_CHAT_PARAMS = { stereo: 'root', view: 'mine', name: '!' };

export const useStartMyChat = () => {
    const queryClient = useQueryClient();

    return useCustomMutation((data: CreateChatDTO) => startMyChat(data), {
        onSuccess: async (newChat: ChatView) => {
            await queryClient.setQueryData(myChatbotKeys.list(MY_CHAT_PARAMS), (oldData: any) => {
                if (!oldData) {
                    return {
                        data: [newChat],
                        list: [newChat],
                        total: 1,
                        page: 0,
                    };
                }

                const existingChat = oldData.data?.find((chat: ChatView) => chat.id === newChat.id);
                if (existingChat) {
                    return oldData;
                }

                return {
                    ...oldData,
                    data: [newChat, ...(oldData.data || [])],
                    list: [newChat, ...(oldData.data || [])],
                    total: (oldData.total || 0) + 1,
                };
            });
        },
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useMyChats = (params: Params) =>
    useQuery<PaginationType<ChatView[]>>({
        queryKey: myChatbotKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchMyChats(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<ChatView[]>;
        },
        refetchOnWindowFocus: false,
    });

export const useDeleteMyChat = () => {
    const queryClient = useQueryClient();

    return useCustomMutation((id: string) => deleteChat(id), {
        onSuccess: async (_, deletedId) => {
            await queryClient.setQueryData(myChatbotKeys.list(MY_CHAT_PARAMS), (oldData: any) => {
                if (!oldData || !oldData.data) {
                    return oldData;
                }

                const filteredData = oldData.data.filter((chat: ChatView) => chat.id !== deletedId);

                return {
                    ...oldData,
                    data: filteredData,
                    list: filteredData,
                    total: Math.max((oldData.total || 0) - 1, 0),
                };
            });
        },
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useRootChats = (params: Params) =>
    useQuery<PaginationType<ChatView[]>>({
        queryKey: rootChatbotsKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchRootChats(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<ChatView[]>;
        },
        refetchOnWindowFocus: false,
    });

export const useChat = (chatId: string) =>
    useQuery<ChatView>({
        queryKey: rootChatbotsKeys.detail(chatId),
        queryFn: async () => {
            const result = await fetchChatById(chatId);
            return result;
        },
        refetchOnWindowFocus: false,
        enabled: !!chatId,
    });

export const useChildChats = (params: Params) =>
    useQuery<PaginationType<ChatView[]>>({
        queryKey: chatbotsKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchChildChats(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<ChatView[]>;
        },
        refetchOnWindowFocus: false,
        enabled: !!params.rootId,
    });

export const useChatMessages = (params: Params) =>
    useInfiniteQuery<PaginationType<ChatView[]>>({
        queryKey: chatKeys.list(params ?? {}),
        queryFn: async ({ pageParam = 0 }) => {
            const result = await fetchChildChats({ ...params, page: pageParam });
            return { ...result, data: result.list || [] } as PaginationType<ChatView[]>;
        },
        getNextPageParam: lastPage => {
            const { page, limit, total } = lastPage;
            const maxPages = Math.ceil(total / limit);
            return page + 1 < maxPages ? page + 1 : undefined;
        },
        initialPageParam: 0,
    });

export const useCreateRootChat = () => {
    return useCustomMutation((data: CreateChatDTO) => createRootChat(data), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useCreateChildChats = () => {
    return useCustomMutation((bulkBody: BulkCreateChildBotsBody) => createChildChats(bulkBody), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useSendMessage = () => {
    return useCustomMutation((sendMessageDTO: SendMessageDTO) => sendMessage(sendMessageDTO), {
        onError: (error, variables) => {
            const errorMessage = error.response?.data || error.message || 'An error occurred while sending the message';
            toast({ title: errorMessage });

            throw {
                response: {
                    data: {
                        list: [
                            {
                                id: generateUUID(),
                                content: variables.body.input,
                                stereo: 'query',
                                isError: true,
                            },
                            {
                                id: generateUUID(),
                                content: errorMessage,
                                stereo: 'answer',
                                isError: true,
                            },
                        ],
                        total: 2,
                    },
                },
            };
        },
    });
};

export const useDeleteChat = () => {
    return useCustomMutation((id: string) => deleteChat(id), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useUpdateChat = () => {
    return useCustomMutation((dto: UpdateChatDTO) => updateChat(dto), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useUpdatePrompt = () => {
    return useCustomMutation((dto: UpdatePromptDTO) => updatePrompt(dto), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useEmbeddings = (params: Params) =>
    useQuery<PaginationType<EmbeddingView[]>>({
        queryKey: embeddingKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchEmbeddings(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<
                EmbeddingView[]
            >;
        },
        refetchOnWindowFocus: false,
    });

export const useBrains = (params: Params) =>
    useQuery<PaginationType<BrainView[]>>({
        queryKey: brainKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchBrains(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<
                BrainView[]
            >;
        },
        refetchOnWindowFocus: false,
    });

export const usePrompts = (params: Params) =>
    useQuery<PaginationType<PromptView[]>>({
        queryKey: promptKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchPrompts(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<
                PromptView[]
            >;
        },
        refetchOnWindowFocus: false,
    });

export const useDocs = (params: DocumentSyncPullParam) =>
    useQuery<DocumentSyncPullResult>({
        queryKey: docsKeys.list({ ...params }),
        queryFn: async () => {
            const result = await fetchDocs(params);
            return { ...result, data: result.list2 || [] } as any;
        },
        refetchOnWindowFocus: false,
        enabled: !!params.type && !!params.siteId,
    });

export const useUpdateDocument = () => {
    return useCustomMutation((dto: UpdateDocumentDTO) => updateDocument(dto), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useDocument = (docId: string) =>
    useQuery<DocumentView>({
        queryKey: docsKeys.detail(docId),
        queryFn: async () => {
            const result = await fetchDocumentById(docId);
            return result;
        },
        refetchOnWindowFocus: false,
        enabled: !!docId,
    });
