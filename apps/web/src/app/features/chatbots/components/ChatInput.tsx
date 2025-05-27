// components/ChatBot/ChatInput.tsx
import { useRef } from 'react';

import { MessageCircleWarning, MessageSquareText, Paperclip, SendHorizontal } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import { cn } from '@eurekabox/lib/utils';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onHelpOpen: (tab: 'faq' | 'chat') => void;
    isHelpOpen: boolean;
    disabled?: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, onHelpOpen, isHelpOpen, disabled = false }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSubmit();
            }
        }
    };

    return (
        <div className="w-full pt-[6px] pr-[16px] pb-[14px] pl-[16px] mt-auto">
            <div
                className={cn(
                    'py-[6px] px-[10px] w-full border border-[#EAEAEC] dark:border-[#3A3C40] rounded-lg overflow-hidden transition-all duration-200 focus-within:border-[#7932FF] dark:focus-within:border-[#7932FF]',
                    isHelpOpen ? 'pb-[9px] rounded-b-none' : ''
                )}
            >
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="AI에게 무엇이든 물어보세요"
                    className="w-full max-h-[231px] overflow-auto resize-none outline-none bg-transparent"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />

                <div className="flex items-center justify-between mt-[6px]">
                    <div className="flex items-center gap-[10px]">
                        <Button variant="ghost" className="h-auto p-[2px] group" onClick={() => onHelpOpen('faq')}>
                            <MessageCircleWarning className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                        <Button variant="ghost" className="h-auto p-[2px] group" onClick={() => onHelpOpen('chat')}>
                            <MessageSquareText className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                        <Button variant="ghost" className="h-auto p-[2px] group">
                            <Paperclip className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                    </div>
                    <button onClick={onSubmit} disabled={!value.trim() || disabled}>
                        <SendHorizontal
                            className="w-[18px] h-[18px]"
                            fill={value.trim() && !disabled ? '#8F19F6' : '#CFD0D3'}
                            stroke={value.trim() && !disabled ? '#8F19F6' : '#CFD0D3'}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};
