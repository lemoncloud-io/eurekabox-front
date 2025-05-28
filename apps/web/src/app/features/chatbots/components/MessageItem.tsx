import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Check, ChevronRight, ChevronUp, Copy, PencilLine, X } from 'lucide-react';
import remarkGfm from 'remark-gfm';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useTheme } from '@eurekabox/theme';

interface MessageItemProps {
    message: ChatView;
    onEdit?: (messageId: string) => void;
}

export const MessageItem = ({ message, onEdit }: MessageItemProps) => {
    const { isDarkTheme } = useTheme();
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);
    const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

    const handleCopy = async () => {
        if (!message.content || copyState === 'copying') return;
        setCopyState('copying');
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(message.content);
            } else {
                // Fallback: execCommand 방식
                const textArea = document.createElement('textarea');
                textArea.value = message.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Copy command failed');
                }
            }
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 1000);
        } catch (error) {
            console.error('Copy failed:', error);
            setCopyState('error');
            toast({
                title: '복사 실패',
                description: '텍스트 복사에 실패했습니다.',
            });
            setTimeout(() => setCopyState('idle'), 1000);
        }
    };

    const getCopyTooltipText = () => {
        switch (copyState) {
            case 'copying':
                return '복사 중';
            case 'copied':
                return '복사됨';
            case 'error':
                return '복사 실패';
            default:
                return '복사';
        }
    };

    const getCopyIcon = () => {
        if (copyState === 'copying') {
            return (
                <div className="w-[14px] h-[14px] border border-[#9FA2A7] border-t-transparent rounded-full animate-spin" />
            );
        }
        if (copyState === 'copied') {
            return <Check className="w-[14px] h-[14px] text-[#8F19F6]" />;
        }
        if (copyState === 'error') {
            return <X className="w-[14px] h-[14px] text-red-600" />;
        }
        return (
            <Copy className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
        );
    };

    const isUserMessage = message.stereo === 'query';
    const isAssistantMessage = message.stereo === 'answer';

    if (isUserMessage) {
        return (
            <div className="pt-[10px] pb-[14px] flex flex-col items-end justify-end">
                <div
                    className={`py-2 px-[14px] max-w-[292px] rounded-tl-[18px] rounded-tr-[3px] rounded-br-[18px] rounded-bl-[18px] ${
                        message['isError']
                            ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            : 'bg-[#F4F5F5] dark:bg-[#3A3C40]'
                    }`}
                >
                    {message.content}
                    {message['isError'] && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">전송 실패 - 다시 시도해주세요</div>
                    )}
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || ''}</ReactMarkdown>
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
                                <Button
                                    variant="ghost"
                                    className="p-[2px] h-auto group"
                                    onClick={handleCopy}
                                    disabled={copyState === 'copying'}
                                >
                                    {getCopyIcon()}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-[#787878] p-1">
                                <p className="dark:text-white">{getCopyTooltipText()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/*TODO: add like / dislike */}
                    {/*<button className="p-[2px]">*/}
                    {/*    <ThumbsUp className="w-[14px] h-[14px] text-[#8F19F6]" />*/}
                    {/*</button>*/}
                    {/*<button className="p-[2px]">*/}
                    {/*    <ThumbsDown className="w-[14px] h-[14px] text-[#9FA2A7]" />*/}
                    {/*</button>*/}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="p-[2px] h-auto group"
                                    onClick={() => onEdit?.(message.id || '')}
                                >
                                    <PencilLine className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-[#787878] p-1">
                                <p className="dark:text-white">편집</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        );
    }

    return null;
};
