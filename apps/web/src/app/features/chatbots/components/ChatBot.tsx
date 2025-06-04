import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import { useUpdateChat } from '@eurekabox/chatbots';
import { useTheme } from '@eurekabox/theme';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { HelpPanel } from './HelpPanel';
import { MessageEditView } from './MessageEditView';
import { MessageItem } from './MessageItem';
import { NewMessageBadge } from './NewMessageBadge';
import { useAutoScroll, useChatState, useNewMessageBadge } from '../hooks';
import { NewChatModal, PricingModal, TestChatSelectModal } from '../modals';

interface ChatBotProps {
    onClose: () => void;
    initialChat: ChatView;
}

export const ChatBot = ({ onClose, initialChat }: ChatBotProps) => {
    const { t } = useTranslation();
    const { isDarkTheme } = useTheme();
    const chatState = useChatState({ initialChat });

    // Modal states
    const [newChatModalOpen, setNewChatModalOpen] = useState(false);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    const [testChatSelectModalOpen, setTestChatSelectModalOpen] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

    // Help panel state
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [activeHelpTab, setActiveHelpTab] = useState<'faq' | 'chat'>('faq');

    const updateChat = useUpdateChat();

    const { containerRef, handleScroll, forceScrollToBottom, shouldAutoScroll } = useAutoScroll({
        dependencies: [chatState.displayMessages.length, chatState.isWaitingResponse, chatState.currentChat?.id],
        threshold: 100,
        behavior: 'smooth',
    });

    const { showBadge, handleBadgeClick } = useNewMessageBadge({
        shouldAutoScroll,
        isWaitingResponse: chatState.isWaitingResponse,
    });

    useEffect(() => {
        const shouldClose =
            chatState.myChats.length === 0 &&
            !chatState.isLoading &&
            !chatState.isWaitingResponse &&
            !chatState.isChatsLoading;

        if (shouldClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [chatState.myChats.length, chatState.isLoading, chatState.isWaitingResponse, chatState.isChatsLoading, onClose]);

    useEffect(() => {
        if (chatState.currentChat) {
            forceScrollToBottom();
        }
    }, [chatState.currentChat?.id, forceScrollToBottom]);

    const onBadgeClick = useCallback(() => {
        handleBadgeClick(forceScrollToBottom);
    }, [handleBadgeClick, forceScrollToBottom]);

    const handleEditMessage = (messageId: string) => {
        setEditingMessageId(messageId);
    };

    const handleSaveEdit = useCallback(
        async (messageId: string, newContent: string) => {
            // eslint-disable-next-line no-useless-catch
            try {
                await updateChat.mutateAsync({
                    chatId: messageId,
                    content: newContent,
                });

                chatState.updateMessage(messageId, newContent);
            } catch (error) {
                throw error;
            }
        },
        [updateChat, chatState.updateMessage]
    );

    const handleCancelEdit = () => {
        setEditingMessageId(null);
    };

    const handleHelpOpen = (tab: 'faq' | 'chat') => {
        setActiveHelpTab(tab);
        setIsHelpOpen(true);
    };

    const handleSubmit = () => {
        if (chatState.input.trim() && !chatState.isLoading && chatState.currentChat) {
            chatState.addMessage(chatState.input);
        } else if (!chatState.currentChat) {
            chatState.createNewConversation();
        }
    };

    const handleFaqClick = useCallback(
        async (faqText: string) => {
            if (chatState.isLoading || chatState.isWaitingResponse) {
                return;
            }

            setIsHelpOpen(false);
            chatState.setInput('');
            if (faqText.trim() && chatState.currentChat) {
                await chatState.addMessage(faqText.trim());
            }
        },
        [chatState, setIsHelpOpen]
    );

    const handleConversationClick = useCallback(
        (conversation: ChatView) => {
            if (chatState.isLoading || chatState.isWaitingResponse) {
                return;
            }

            if (chatState.currentChat?.id !== conversation.id) {
                chatState.setCurrentChat(conversation);
                setIsHelpOpen(false);
            }
        },
        [chatState.currentChat?.id, chatState.setCurrentChat, chatState.isLoading, chatState.isWaitingResponse]
    );

    const handleNewChatCreated = useCallback(
        (newChat: ChatView) => {
            chatState.setCurrentChat(newChat);
        },
        [chatState.setCurrentChat]
    );

    const editingMessage = editingMessageId ? chatState.displayMessages.find(msg => msg.id === editingMessageId) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 text-text flex gap-6"
        >
            {editingMessage ? (
                <MessageEditView
                    message={editingMessage}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    isLoading={updateChat.isPending}
                />
            ) : (
                <div className="w-[484px] min-h-[350px] max-h-[800px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
                    <ChatHeader
                        modelName={chatState.currentChat?.name || t('ai.chat.untitled')}
                        onClose={onClose}
                        onNewChat={() => setNewChatModalOpen(true)}
                        onTestChat={() => setTestChatSelectModalOpen(true)}
                        onPricing={() => setPricingModalOpen(true)}
                    />

                    <main ref={containerRef} onScroll={handleScroll} className="px-4 w-full overflow-auto flex-1">
                        {!chatState.currentChat || chatState.displayMessages.length === 0 ? (
                            <div className="py-[10px]">
                                <img
                                    src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                    alt="chatbot image"
                                    className="w-9 h-9"
                                />
                                <div className="text-base font-medium mt-[3px]">{t('ai.chatbot.greeting')}</div>
                            </div>
                        ) : (
                            <>
                                {chatState.displayMessages.map(message => (
                                    <MessageItem key={message.id} message={message} onEdit={handleEditMessage} />
                                ))}

                                {chatState.isWaitingResponse && (
                                    <div className="py-[10px] px-[14px] flex items-center gap-[9px]">
                                        <img
                                            src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                            alt="chatbot image"
                                            className="w-6 h-6"
                                        />
                                        <div className="flex items-center gap-1 text-[#9FA2A7]">
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce"></div>
                                            </div>
                                            <span>{t('ai.chatbot.generating_response')}</span>
                                        </div>
                                    </div>
                                )}

                                {chatState.isLoading && !chatState.isWaitingResponse && (
                                    <div className="py-[10px] px-[14px] flex items-center gap-[9px]">
                                        <img
                                            src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                            alt="chatbot image"
                                            className="w-6 h-6"
                                        />
                                        <div className="text-[#9FA2A7]">{t('ai.chatbot.loading_messages')}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>

                    <NewMessageBadge show={showBadge} onClick={onBadgeClick} />

                    <ChatInput
                        value={chatState.input}
                        onChange={chatState.setInput}
                        onSubmit={handleSubmit}
                        onHelpOpen={handleHelpOpen}
                        isHelpOpen={isHelpOpen}
                        disabled={chatState.isLoading || chatState.isWaitingResponse}
                    />

                    {isHelpOpen && (
                        <HelpPanel
                            activeTab={activeHelpTab}
                            onTabChange={setActiveHelpTab}
                            onClose={() => setIsHelpOpen(false)}
                            conversations={chatState.myChats}
                            onDeleteConversation={chatState.deleteConversation}
                            onTogglePinConversation={chatState.togglePinConversation}
                            onFaqClick={handleFaqClick}
                            onConversationClick={handleConversationClick}
                            currentChatId={chatState.currentChat?.id}
                            isDisabled={chatState.isLoading || chatState.isWaitingResponse}
                        />
                    )}
                </div>
            )}

            {!editingMessage && (
                <>
                    <NewChatModal
                        open={newChatModalOpen}
                        onOpenChange={setNewChatModalOpen}
                        onChatCreated={handleNewChatCreated}
                    />
                    <TestChatSelectModal
                        open={testChatSelectModalOpen}
                        onOpenChange={setTestChatSelectModalOpen}
                        closeChatbot={onClose}
                    />
                    <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
                </>
            )}
        </motion.div>
    );
};
