import { useCallback, useState } from 'react';

import {
    AI_RESPONSES,
    DEFAULT_RESPONSE,
    DUMMY_RELATED_DOCUMENTS,
    createDummyConversations,
    generateId,
} from '../data/dummyData';
import type { ChatState, Conversation, Message } from '../types';

const getAIResponse = (userInput: string): { content: string; relatedDocuments?: typeof DUMMY_RELATED_DOCUMENTS } => {
    const input = userInput.toLowerCase();

    // Find matching response category
    const matchedCategory = AI_RESPONSES.find(category => category.keywords.some(keyword => input.includes(keyword)));

    const responses = matchedCategory ? matchedCategory.responses : DEFAULT_RESPONSE;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Add related documents for certain keywords
    const shouldIncludeDocs = input.includes('도움') || input.includes('문서') || input.includes('가이드');

    return {
        content: randomResponse,
        relatedDocuments: shouldIncludeDocs ? DUMMY_RELATED_DOCUMENTS : undefined,
    };
};

export const useChatState = () => {
    const [state, setState] = useState<ChatState>(() => {
        const conversations = createDummyConversations();
        return {
            conversations,
            currentConversation: conversations[0] || null,
            isLoading: false,
            input: '',
        };
    });

    const setInput = useCallback((input: string) => {
        setState(prev => ({ ...prev, input }));
    }, []);

    const setCurrentConversation = useCallback((conversation: Conversation | null) => {
        setState(prev => ({ ...prev, currentConversation: conversation }));
    }, []);

    const addMessage = useCallback(
        async (messageContent: string) => {
            if (!messageContent.trim()) return;

            setState(prev => ({ ...prev, isLoading: true }));

            // Create user message
            const userMessage: Message = {
                id: generateId(),
                content: messageContent.trim(),
                role: 'user',
                timestamp: new Date(),
            };

            // Update current conversation or create new one
            let updatedConversation: Conversation;

            if (state.currentConversation) {
                updatedConversation = {
                    ...state.currentConversation,
                    messages: [...state.currentConversation.messages, userMessage],
                    updatedAt: new Date(),
                };
            } else {
                updatedConversation = {
                    id: generateId(),
                    title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
                    messages: [userMessage],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isPinned: false,
                };
            }

            // Update conversations list
            setState(prev => {
                const existingIndex = prev.conversations.findIndex(c => c.id === updatedConversation.id);
                const conversations =
                    existingIndex >= 0
                        ? prev.conversations.map(c => (c.id === updatedConversation.id ? updatedConversation : c))
                        : [updatedConversation, ...prev.conversations];

                return {
                    ...prev,
                    conversations,
                    currentConversation: updatedConversation,
                    input: '',
                };
            });

            // Simulate AI response delay
            setTimeout(() => {
                const aiResponse = getAIResponse(messageContent);
                const assistantMessage: Message = {
                    id: generateId(),
                    content: aiResponse.content,
                    role: 'assistant',
                    timestamp: new Date(),
                    relatedDocuments: aiResponse.relatedDocuments,
                };

                setState(prev => {
                    const currentConv = prev.currentConversation!;
                    const updatedConv = {
                        ...currentConv,
                        messages: [...currentConv.messages, assistantMessage],
                        updatedAt: new Date(),
                    };

                    return {
                        ...prev,
                        conversations: prev.conversations.map(c => (c.id === updatedConv.id ? updatedConv : c)),
                        currentConversation: updatedConv,
                        isLoading: false,
                    };
                });
            }, 1000 + Math.random() * 2000); // 1-3초 랜덤 딜레이
        },
        [state.currentConversation]
    );

    const createNewConversation = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentConversation: null,
            input: '',
        }));
    }, []);

    const deleteConversation = useCallback((id: string) => {
        setState(prev => {
            const conversations = prev.conversations.filter(conv => conv.id !== id);
            const currentConversation =
                prev.currentConversation?.id === id ? conversations[0] || null : prev.currentConversation;

            return {
                ...prev,
                conversations,
                currentConversation,
            };
        });
    }, []);

    const togglePinConversation = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(conv =>
                conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
            ),
        }));
    }, []);

    return {
        ...state,
        setInput,
        setCurrentConversation,
        addMessage,
        createNewConversation,
        deleteConversation,
        togglePinConversation,
    };
};
