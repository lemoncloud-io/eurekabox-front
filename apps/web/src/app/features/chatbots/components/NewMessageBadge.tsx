import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';

interface NewMessageBadgeProps {
    show: boolean;
    onClick: () => void;
}

export const NewMessageBadge = ({ show, onClick }: NewMessageBadgeProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                        duration: 0.3,
                    }}
                    className="absolute bottom-[100px] left-1/2 transform -translate-x-1/2 z-20"
                >
                    <button
                        onClick={onClick}
                        className="relative flex items-center gap-2 bg-[#7932FF] hover:bg-[#6028E0] text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">새 메시지</span>
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
