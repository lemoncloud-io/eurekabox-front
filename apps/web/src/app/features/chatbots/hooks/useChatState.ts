import { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import {
    MY_CHAT_PARAMS,
    chatKeys,
    generateUUID,
    myChatbotKeys,
    useChatMessages,
    useDeleteMyChat,
    useMyChats,
    useSendMessage,
    useStartMyChat,
} from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';

import { usePinnedConversationsStore } from '../stores';
import type { ChatState } from '../types';

interface UseChatStateProps {
    initialChat: ChatView;
}

export const useChatState = ({ initialChat }: UseChatStateProps) => {
    const queryClient = useQueryClient();
    const { profile } = useWebCoreStore();
    const { removePin } = usePinnedConversationsStore();

    const [state, setState] = useState<ChatState>({
        myChats: [],
        currentChat: initialChat || null,
        messages: [],
        pendingMessage: null,
        isLoading: false,
        isWaitingResponse: false,
        input: '',
    });

    const { data: myChatsData, isLoading: chatsLoading } = useMyChats(MY_CHAT_PARAMS);
    const { data: messagesData } = useChatMessages({
        rootId: state.currentChat?.id,
        limit: -1,
    });
    const startMyChat = useStartMyChat();
    const sendMessage = useSendMessage();
    const deleteMyChat = useDeleteMyChat();

    // 내 채팅 목록 로드
    useEffect(() => {
        if (myChatsData?.data) {
            setState(prev => ({
                ...prev,
                myChats: myChatsData.data,
            }));
        }
    }, [myChatsData]);

    // 현재 채팅의 메시지들 로드
    useEffect(() => {
        if (messagesData?.pages) {
            const allMessages = messagesData.pages
                .reduce((acc, page) => [...acc, ...(page.data || [])], [])
                .filter(msg => msg.id && msg.content)
                .sort((a, b) => (a.childNo || 0) - (b.childNo || 0));

            setState(prev => ({ ...prev, messages: allMessages }));
        }
    }, [messagesData]);

    const clearPendingMessage = useCallback(() => {
        setState(prev => ({
            ...prev,
            pendingMessage: null,
            isWaitingResponse: false,
        }));
    }, []);

    const setInput = useCallback((input: string) => {
        setState(prev => ({ ...prev, input }));
    }, []);

    const setCurrentChat = useCallback(
        (chat: ChatView | null) => {
            setState(prev => ({
                ...prev,
                currentChat: chat,
                messages: [],
                pendingMessage: null,
                isWaitingResponse: false,
            }));

            if (chat && !state.myChats.find(c => c.id === chat.id)) {
                setState(prev => ({
                    ...prev,
                    myChats: [chat, ...prev.myChats],
                }));
            }
        },
        [state.myChats]
    );

    const addMessage = useCallback(
        async (messageContent: string) => {
            if (!messageContent.trim() || !state.currentChat?.id) {
                return;
            }

            const userMessage: ChatView = {
                id: generateUUID(),
                content: messageContent.trim(),
                stereo: 'query',
                createdAt: new Date().toISOString(),
                childNo: (state.messages.length + 1) * 10,
            } as ChatView;

            setState(prev => ({
                ...prev,
                pendingMessage: userMessage,
                isWaitingResponse: true,
                input: '',
            }));

            try {
                const res = await sendMessage.mutateAsync({
                    groupId: state.currentChat.id!,
                    body: {
                        ...(profile?.sid && { sid: profile.sid }),
                        input: messageContent.trim(),
                    },
                });

                await updateChatMessages(state.currentChat.id, res.list || []);
                clearPendingMessage();
            } catch (error) {
                console.error('Failed to send message:', error);
                setState(prev => ({
                    ...prev,
                    pendingMessage: prev.pendingMessage
                        ? {
                              ...prev.pendingMessage,
                              isError: true,
                          }
                        : null,
                    isWaitingResponse: false,
                }));
                toast({ title: '메시지 전송에 실패했습니다.' });
            }
        },
        [state.currentChat, sendMessage, queryClient, clearPendingMessage]
    );

    const displayMessages = useMemo(() => {
        const allMessages = [...state.messages];
        if (state.pendingMessage) {
            allMessages.push(state.pendingMessage);
        }
        return allMessages.sort((a, b) => (a.childNo || 0) - (b.childNo || 0));
    }, [state.messages, state.pendingMessage]);

    const createNewConversation = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const profile$: ChatUserProfile = {
                ...(profile?.sid && { sid: profile.sid }),
                ...(profile?.uid && { uid: profile.uid }),
                ...(profile?.$user?.gender && { gender: profile?.$user?.gender }),
                ...(profile?.$user?.name && { name: profile?.$user?.name }),
            };

            await startMyChat.mutateAsync(
                { name: `새 채팅 ${new Date().toLocaleTimeString()}`, profile$ },
                {
                    onSuccess: async (newChat: ChatView) => {
                        await queryClient.invalidateQueries(myChatbotKeys.invalidateList());
                        setState(prev => ({
                            ...prev,
                            currentChat: newChat,
                            messages: [],
                            input: '',
                            pendingMessage: null,
                            isWaitingResponse: false,
                        }));
                    },
                }
            );
        } catch (error) {
            console.error('Failed to create new conversation:', error);
            toast({ title: '새 채팅 생성에 실패했습니다.' });
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [startMyChat, queryClient]);

    const deleteConversation = useCallback(
        async (id: string) => {
            try {
                await deleteMyChat.mutateAsync(id);

                setState(prev => {
                    const remainingChats = prev.myChats.filter(chat => chat.id !== id);
                    const newCurrentChat = prev.currentChat?.id === id ? remainingChats[0] || null : prev.currentChat;

                    removePin(id);

                    return {
                        ...prev,
                        myChats: remainingChats,
                        currentChat: newCurrentChat,
                        messages: newCurrentChat ? prev.messages : [],
                    };
                });

                toast({ title: '채팅이 삭제되었습니다.' });
            } catch (error) {
                console.error('Failed to delete conversation:', error);
                toast({ title: '채팅 삭제에 실패했습니다.' });
            }
        },
        [deleteMyChat, queryClient]
    );

    const togglePinConversation = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            myChats: prev.myChats.map(chat => (chat.id === id ? { ...chat, isPinned: !chat['isPinned'] } : chat)),
        }));
    }, []);

    const updateMessage = useCallback((messageId: string, updatedContent: string) => {
        setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => (msg.id === messageId ? { ...msg, updatedContent } : msg)),
        }));
    }, []);

    const updateChatMessages = async (chatId: string, newMessages: ChatView[]) => {
        await queryClient.setQueryData(chatKeys.list({ rootId: chatId, limit: -1 }), (oldData: any) => {
            if (!oldData) {
                return oldData;
            }

            const newFirstPage = {
                ...oldData.pages[0],
                data: [...(oldData.pages[0].data || []), ...newMessages],
            };
            return {
                ...oldData,
                pages: [newFirstPage, ...oldData.pages.slice(1)],
                pageParams: oldData.pageParams,
            };
        });
    };

    return {
        ...state,
        displayMessages,
        setInput,
        setCurrentChat,
        addMessage,
        createNewConversation,
        deleteConversation,
        togglePinConversation,
        updateMessage,
        clearPendingMessage,
        isChatsLoading: chatsLoading,
    };
};
