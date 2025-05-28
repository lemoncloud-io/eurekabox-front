import { useState } from 'react';

import { motion } from 'framer-motion';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import { useTheme } from '@eurekabox/theme';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { HelpPanel } from './HelpPanel';
import { MessageEditView } from './MessageEditView';
import { MessageItem } from './MessageItem';
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
        console.log(chatState.currentChat);
        return;
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

    if (chatState.isLoading) {
        return (
            <motion.div className="fixed bottom-6 right-6 text-text flex gap-6">
                <div className="w-[484px] min-h-[350px] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#7932FF] border-t-transparent rounded-full animate-spin" />
                        <span>채팅을 불러오는 중...</span>
                    </div>
                </div>
            </motion.div>
        );
    }

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
                        modelName="Got-4o-mini"
                        onClose={onClose}
                        onNewChat={() => setNewChatModalOpen(true)}
                        onTestChat={() => setTestChatSelectModalOpen(true)}
                        onPricing={() => setPricingModalOpen(true)}
                    />

                    <main className="px-4 w-full overflow-auto flex-1">
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
                                {chatState.messages.map(message => (
                                    <MessageItem key={message.id} message={message} onEdit={handleEditMessage} />
                                ))}
                                {chatState.isLoading && (
                                    <div className="py-[10px] px-[14px] flex items-center gap-[9px]">
                                        <img
                                            src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                            alt="chatbot image"
                                            className="w-6 h-6"
                                        />
                                        <div className="text-[#9FA2A7]">응답을 생성하고 있습니다...</div>
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
                        disabled={chatState.isLoading}
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
