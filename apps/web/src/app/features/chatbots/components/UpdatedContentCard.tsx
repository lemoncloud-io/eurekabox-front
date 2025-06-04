import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Check, Copy, Maximize2, X } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { toast } from '@eurekabox/lib/hooks/use-toast';

interface UpdatedContentCardProps {
    content: string;
    onMaximize: () => void;
    title?: string;
    className?: string;
}

export const UpdatedContentCard = ({ content, onMaximize, title, className = '' }: UpdatedContentCardProps) => {
    const { t } = useTranslation();
    const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

    const cardTitle = title || t('updatedContent.question_summary');

    const handleCopy = async () => {
        if (!content || copyState === 'copying') {
            return;
        }

        setCopyState('copying');

        try {
            await navigator.clipboard.writeText(content);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 1000);
        } catch (error) {
            console.error('Copy failed:', error);
            setCopyState('error');
            toast({
                title: t('updatedContent.copy_failed'),
                description: t('updatedContent.copy_failed_description'),
            });
            setTimeout(() => setCopyState('idle'), 1000);
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

    const getCopyTooltipText = () => {
        switch (copyState) {
            case 'copying':
                return t('updatedContent.copying');
            case 'copied':
                return t('updatedContent.copied');
            case 'error':
                return t('updatedContent.copy_failed');
            default:
                return t('updatedContent.copy');
        }
    };

    return (
        <div
            className={`max-w-[278px] min-h-[197px] ml-[33px] rounded-xl border border-[#F4F5F5] dark:border-[#3A3C40] bg-white dark:bg-[#262626] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] py-3 px-4 flex flex-col ${className}`}
        >
            <div className="flex items-center gap-[14px] sticky top-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-auto p-[2px] group" onClick={onMaximize}>
                                <Maximize2 className="w-[14px] h-[14px] text-[#84888F] group-hover:text-text transition-colors duration-200" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-[#787878] p-1">
                            <p className="dark:text-white">{t('updatedContent.edit')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="text-[13px] font-medium text-[#84888F]">{cardTitle}</div>
            </div>

            <div
                className="mt-3 w-full line-clamp-[6] flex-1 text-text-700"
                style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {content}
            </div>

            <div className="pt-1 mt-auto">
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
            </div>
        </div>
    );
};
