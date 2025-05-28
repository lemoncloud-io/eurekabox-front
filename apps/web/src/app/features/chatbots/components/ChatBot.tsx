import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import { useTheme } from '@eurekabox/theme';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { HelpPanel } from './HelpPanel';
import { MessageEditView } from './MessageEditView';
import { MessageItem } from './MessageItem';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useChatState } from '../hooks/useChatState';
import { NewChatModal } from '../modals/NewChatModal';
import { PricingModal } from '../modals/PricingModal';
import { TestChatSelectModal } from '../modals/TestChatSelectModal';

interface ChatBotProps {
    onClose: () => void;
    initialChat: ChatView;
}

export const ChatBot = ({ onClose, initialChat }: ChatBotProps) => {
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

    const { containerRef, handleScroll, forceScrollToBottom } = useAutoScroll({
        dependencies: [chatState.displayMessages.length, chatState.isWaitingResponse, chatState.currentChat?.id],
        threshold: 100,
        behavior: 'smooth',
    });

    useEffect(() => {
        if (chatState.currentChat) {
            forceScrollToBottom();
        }
    }, [chatState.currentChat?.id, forceScrollToBottom]);

    const handleEditMessage = (messageId: string) => {
        setEditingMessageId(messageId);
    };

    const handleSaveEdit = (messageId: string, newContent: string) => {
        chatState.updateMessage(messageId, newContent);
    };

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

    const handleNewChat = () => {
        setNewChatModalOpen(false);
    };

    const editingMessage = editingMessageId ? chatState.messages.find(msg => msg.id === editingMessageId) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 text-text flex gap-6"
        >
            {editingMessage ? (
                <MessageEditView message={editingMessage} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
            ) : (
                <div className="w-[484px] min-h-[350px] max-h-[800px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
                    <ChatHeader
                        modelName="Gpt-4o-mini"
                        onClose={onClose}
                        onNewChat={() => setNewChatModalOpen(true)}
                        onTestChat={() => setTestChatSelectModalOpen(true)}
                        onPricing={() => setPricingModalOpen(true)}
                    />

                    <main ref={containerRef} onScroll={handleScroll} className="px-4 w-full overflow-auto flex-1">
                        {!chatState.currentChat ? (
                            <div className="py-[10px]">
                                <img
                                    src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                    alt="chatbot image"
                                    className="w-9 h-9"
                                />
                                <div className="text-base font-medium mt-[3px]">무엇을 도와드릴까요?</div>
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
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1 h-1 bg-[#9FA2A7] rounded-full animate-bounce"></div>
                                            </div>
                                            <span>응답을 생성하고 있습니다</span>
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
                                        <div className="text-[#9FA2A7]">메시지를 불러오고 있습니다...</div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>

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
                        />
                    )}
                </div>
            )}

            {!editingMessage && (
                <>
                    <NewChatModal
                        open={newChatModalOpen}
                        onOpenChange={setNewChatModalOpen}
                        onNewChat={handleNewChat}
                    />
                    <TestChatSelectModal open={testChatSelectModalOpen} onOpenChange={setTestChatSelectModalOpen} />
                    <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
                </>
            )}
        </motion.div>
    );
};
