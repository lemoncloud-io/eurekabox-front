import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import {
    chatKeys,
    myChatbotKeys,
    useChatMessages,
    useDeleteChat,
    useMyChats,
    useSendMessage,
    useStartMyChat,
} from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';



import type { ChatState } from '../types';

interface UseChatStateProps {
    initialChat: ChatView;
}

export const useChatState = ({ initialChat }: UseChatStateProps) => {
    const queryClient = useQueryClient();
    const { profile } = useWebCoreStore();

    const [state, setState] = useState<ChatState>({
        myChats: [],
        currentChat: initialChat || null,
        messages: [],
        isLoading: false,
        input: '',
    });

    const { data: myChatsData, isLoading: chatsLoading } = useMyChats({ page: 0 });
    const { data: messagesData } = useChatMessages({
        rootId: state.currentChat?.id,
        limit: -1,
    });
    const startMyChat = useStartMyChat();
    const sendMessage = useSendMessage();
    const deleteChat = useDeleteChat();

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

    const setInput = useCallback((input: string) => {
        setState(prev => ({ ...prev, input }));
    }, []);

    const setCurrentChat = useCallback((chat: ChatView | null) => {
        setState(prev => ({ ...prev, currentChat: chat, messages: [] }));
    }, []);

    const addMessage = useCallback(
        async (messageContent: string) => {
            if (!messageContent.trim() || !state.currentChat?.id) return;

            setState(prev => ({ ...prev, isLoading: true }));

            try {
                await sendMessage.mutateAsync({
                    rootId: state.currentChat.id!,
                    body: { input: messageContent.trim() },
                });

                // 메시지 전송 후 갱신
                await queryClient.invalidateQueries(chatKeys.list({ rootId: state.currentChat.id }));

                setState(prev => ({ ...prev, input: '' }));
            } catch (error) {
                console.error('Failed to send message:', error);
                toast({ title: '메시지 전송에 실패했습니다.' });
            } finally {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        },
        [state.currentChat, sendMessage, queryClient]
    );

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
                await deleteChat.mutateAsync(id);
                await queryClient.invalidateQueries(myChatbotKeys.invalidateList());

                setState(prev => {
                    const remainingChats = prev.myChats.filter(chat => chat.id !== id);
                    const newCurrentChat = prev.currentChat?.id === id ? remainingChats[0] || null : prev.currentChat;

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
        [deleteChat, queryClient]
    );

    const togglePinConversation = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            myChats: prev.myChats.map(chat => (chat.id === id ? { ...chat, isPinned: !chat['isPinned'] } : chat)),
        }));
    }, []);

    const updateMessage = useCallback((messageId: string, newContent: string) => {
        setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => (msg.id === messageId ? { ...msg, content: newContent } : msg)),
        }));
    }, []);

    return {
        ...state,
        setInput,
        setCurrentChat,
        addMessage,
        createNewConversation,
        deleteConversation,
        togglePinConversation,
        updateMessage,
        isChatsLoading: chatsLoading,
    };
};
