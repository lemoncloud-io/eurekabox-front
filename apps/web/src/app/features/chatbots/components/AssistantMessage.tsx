import { useState } from 'react';

import { Copy, PencilLine, ThumbsDown, ThumbsUp } from 'lucide-react';

import { Images } from '@eurekabox/assets';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { useTheme } from '@eurekabox/theme';

import { RelatedDocuments } from './RelatedDocuments';
import type { Message } from '../types';

interface AssistantMessageProps {
    message: Message;
}

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
    const { isDarkTheme } = useTheme();
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);

    return (
        <div className="py-[10px] px-[14px] flex flex-col space-y-[9px]">
            <div className="flex items-center gap-[9px]">
                <img src={isDarkTheme ? Images.chatBotDark : Images.chatBot} alt="chatbot image" className="w-6 h-6" />
                <div>{message.content}</div>
            </div>

            {message.relatedDocuments && message.relatedDocuments.length > 0 && (
                <RelatedDocuments
                    documents={message.relatedDocuments}
                    isOpen={isDocumentsOpen}
                    onToggle={() => setIsDocumentsOpen(!isDocumentsOpen)}
                />
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
                <Button variant="ghost" className="p-[2px] h-auto group">
                    <PencilLine className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                </Button>
            </div>
        </div>
    );
};
