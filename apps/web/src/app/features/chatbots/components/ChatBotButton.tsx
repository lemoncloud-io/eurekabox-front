import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { Images } from '@eurekabox/assets';
import { useTheme } from '@eurekabox/theme';

import { ChatBot } from './ChatBot';

export const ChatBotButton = () => {
    const { isDarkTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                initial={false}
                animate={{
                    scale: isOpen ? 0 : 1,
                    opacity: isOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-6 right-6 rounded-full w-[62px] h-[62px] flex items-center justify-center border-[#7932FF] border-[0.5px] bg-chatbot-card shadow-[2px_2px_10px_0px_rgba(0,0,0,0.10)] overflow-hidden z-50"
            >
                <img
                    src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                    alt="chatbot button"
                    className="w-[51px] h-[51px]"
                />
            </motion.button>
            <AnimatePresence>{isOpen && <ChatBot onClose={() => setIsOpen(false)} />}</AnimatePresence>
        </>
    );
};
