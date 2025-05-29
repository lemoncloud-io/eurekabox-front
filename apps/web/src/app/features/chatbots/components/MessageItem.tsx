import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Check, ChevronRight, ChevronUp, Copy, PencilLine, X } from 'lucide-react';
import remarkGfm from 'remark-gfm';

import type { DocumentHead } from '@lemoncloud/ssocio-chatbots-api/dist/modules/chatbots/model';

import { Images } from '@eurekabox/assets';
import { useDocument } from '@eurekabox/chatbots';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useTheme } from '@eurekabox/theme';

import type { MyChatView } from '../types';
import { UpdatedContentCard } from './UpdatedContentCard';

interface MessageItemProps {
    message: MyChatView;
    onEdit?: (messageId: string) => void;
}

export const MessageItem = ({ message, onEdit }: MessageItemProps) => {
    const { isDarkTheme } = useTheme();
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

    const { data: selectedDocument, isLoading: isDocumentLoading } = useDocument(selectedDocId || '');

    const handleDocumentClick = (document: DocumentHead) => {
        setSelectedDocId(document.id);
    };

    const handleCloseDialog = () => {
        setSelectedDocId(null);
    };

    const handleCopy = async () => {
        if (!message.content || copyState === 'copying') {
            return;
        }

        setCopyState('copying');

        try {
            await navigator.clipboard.writeText(message.content);
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
                {message.documentIds && message.documentIds.length > 0 && message.document$$?.length > 0 && (
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
                                    {message.document$$.map((document, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-[3px] cursor-pointer text-text-800 hover:text-text-900 transition-colors"
                                            onClick={() => handleDocumentClick(document)}
                                        >
                                            <div className="text-xs truncate hover:underline">{document.name}</div>
                                            <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={!!selectedDocId} onOpenChange={handleCloseDialog}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>참고문서 상세</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {isDocumentLoading ? (
                                <div className="flex items-center gap-2 justify-center py-8">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-sm text-text-500">문서를 불러오는 중...</span>
                                </div>
                            ) : selectedDocument ? (
                                <div className="space-y-3">
                                    <div className="border-b border-border pb-2">
                                        <div className="font-semibold text-sm text-text-700">문서명</div>
                                        <div className="text-sm">{selectedDocument.name || '제목 없음'}</div>
                                    </div>
                                    <div className="border-b border-border pb-2">
                                        <div className="font-semibold text-sm text-text-700">문서 ID</div>
                                        <div className="text-xs font-mono text-text-500">{selectedDocument.id}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-text-700 mb-2">내용</div>
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-[#F8F9FA] dark:bg-[#2A2D31] p-4 rounded-lg border">
                                            {selectedDocument.content || '내용이 없습니다.'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-500">문서를 찾을 수 없습니다.</div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

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

                {message.updatedContent && (
                    <UpdatedContentCard
                        content={message.updatedContent}
                        onMaximize={() => onEdit?.(message.id || '')}
                        title="질문 요약"
                    />
                )}
            </div>
        );
    }

    return null;
};
