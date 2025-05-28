import { useState } from 'react';

import { ChevronRight, ChevronUp, Copy, PencilLine, ThumbsDown, ThumbsUp } from 'lucide-react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';


import { Images } from '@eurekabox/assets';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { useTheme } from '@eurekabox/theme';

interface MessageItemProps {
    message: ChatView;
    onEdit?: (messageId: string) => void;
}

export const MessageItem = ({ message, onEdit }: MessageItemProps) => {
    const { isDarkTheme } = useTheme();
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);

    const isUserMessage = message.stereo === 'query';
    const isAssistantMessage = message.stereo === 'answer';

    if (isUserMessage) {
        return (
            <div className="pt-[10px] pb-[14px] flex flex-col items-end justify-end">
                <div className="py-2 px-[14px] max-w-[292px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-tl-[18px] rounded-tr-[3px] rounded-br-[18px] rounded-bl-[18px]">
                    {message.content}
                </div>
            </div>
        );
    }

    if (isAssistantMessage) {
        return (
            <div className="py-[10px] px-[14px] flex flex-col space-y-[9px]">
                <div className="flex items-center gap-[9px]">
                    <img
                        src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                        alt="chatbot image"
                        className="w-6 h-6"
                    />
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                        {/*TODO: add <ReactMarkdown remarkPlugins={[remarkGfm]}>*/}
                        {message.content || ''}
                        {/*</ReactMarkdown>*/}
                    </div>
                </div>

                {message.documentIds && message.documentIds.length > 0 && (
                    <div>
                        <div
                            className="flex items-center gap-1 pl-[3px] mb-1 cursor-pointer"
                            onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
                        >
                            <div className="text-[#007AFF] text-xs">관련문서</div>
                            <ChevronUp
                                className={`text-[#007AFF] w-[13px] h-[13px] transform transition-transform duration-200 ${
                                    isDocumentsOpen ? 'rotate-0' : 'rotate-180'
                                }`}
                            />
                        </div>

                        {isDocumentsOpen && (
                            <div className="py-[2px] px-[9px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-lg w-fit max-w-full">
                                <ul className="flex flex-col space-y-[3px]">
                                    {message.documentIds.map((docId, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-[3px] cursor-pointer text-text-800"
                                        >
                                            <div className="text-xs truncate hover:underline">{docId}</div>
                                            <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-[6px]">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="p-[2px] h-auto group">
                                    <Copy className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-[#787878] p-1">
                                <p className="dark:text-white">복사</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <button className="p-[2px]">
                        <ThumbsUp className="w-[14px] h-[14px] text-[#8F19F6]" />
                    </button>
                    <button className="p-[2px]">
                        <ThumbsDown className="w-[14px] h-[14px] text-[#9FA2A7]" />
                    </button>
                    <Button variant="ghost" className="p-[2px] h-auto group" onClick={() => onEdit?.(message.id || '')}>
                        <PencilLine className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};
