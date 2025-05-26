import { Paperclip, SendHorizontal } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';

import { ChatBotTest } from '../components/ChatBotTest';

export const ChatBotTestPage = () => {
    return (
        <div className="flex flex-col items-center px-6">
            <main className="grid grid-cols-3 gap-6 pt-[22px] pb-[150px] overflow-auto">
                <ChatBotTest />
                <ChatBotTest />
                <ChatBotTest />
                <ChatBotTest />
                <ChatBotTest />
                <ChatBotTest />
                <ChatBotTest />
            </main>
            <footer className="h-[116px] flex items-center justify-center fixed bottom-0 right-0 left-0 border-t border-[#BABCC0] dark:border-[#787878] bg-chatbot-card">
                <div className="w-[702px] py-7 px-4">
                    <div className="py-[6px] px-[10px] w-full border border-[#EAEAEC] dark:border-[#3A3C40] rounded-lg overflow-hidden transition-all duration-200 focus-within:border-[#7932FF]">
                        <textarea
                            rows={1}
                            placeholder="AI에게 무엇이든 물어보세요"
                            className="w-full max-h-[231px] overflow-auto resize-none outline-none bg-chatbot-card text-text"
                        />

                        <div className="flex items-center justify-between mt-[6px]">
                            <Button variant="ghost" className="h-auto p-[2px] group">
                                <Paperclip className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                            </Button>
                            <button>
                                {/* 활성화 색상:#8F19F6 */}
                                <SendHorizontal className="w-[18px] h-[18px]" fill="#CFD0D3" stroke="#CFD0D3" />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
