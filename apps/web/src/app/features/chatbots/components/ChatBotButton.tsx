import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import { useStartMyChat } from '@eurekabox/chatbots';
import { useTheme } from '@eurekabox/theme';
import { useWebCoreStore } from '@eurekabox/web-core';

import { ChatBot } from './ChatBot';

export const ChatBotButton = () => {
    const { isDarkTheme } = useTheme();
    const { profile } = useWebCoreStore();

    const [isOpen, setIsOpen] = useState(false);
    const [currentChat, setCurrentChat] = useState<ChatView | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const startMyChat = useStartMyChat();

    const handleOpenChat = async () => {
        if (isCreating) {
            return;
        }

        try {
            setIsCreating(true);
            const profile$: ChatUserProfile = {
                ...(profile?.sid && { sid: profile.sid }),
                ...(profile?.uid && { uid: profile.uid }),
                ...(profile?.$user?.gender && { gender: profile?.$user?.gender }),
                ...(profile?.$user?.name && { name: profile?.$user?.name }),
            };
            const newChat = await startMyChat.mutateAsync({ profile$ });

            setCurrentChat(newChat);
            setIsOpen(true);
        } catch (error) {
            console.error('Failed to create new chat:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloseChat = () => {
        setIsOpen(false);
        setCurrentChat(null);
    };

    return (
        <>
            <motion.button
                onClick={handleOpenChat}
                initial={false}
                animate={{
                    scale: isOpen ? 0 : 1,
                    opacity: isOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-6 right-6 rounded-full w-[62px] h-[62px] flex items-center justify-center border-[#7932FF] border-[0.5px] bg-chatbot-card shadow-[2px_2px_10px_0px_rgba(0,0,0,0.10)] overflow-hidden z-50"
                disabled={isCreating}
            >
                <img
                    src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                    alt="chatbot button"
                    className="w-[51px] h-[51px]"
                />
                {isCreating && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </motion.button>
            <AnimatePresence>
                {isOpen && currentChat && <ChatBot onClose={handleCloseChat} initialChat={currentChat} />}
            </AnimatePresence>
        </>
    );
};
