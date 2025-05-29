import { useRef } from 'react';

import { Paperclip, SendHorizontal } from 'lucide-react';

import { cn } from '@eurekabox/ui-kit';
import { Button } from '@eurekabox/ui-kit/components/ui/button';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isDisabled: boolean;
    isLoading: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isDisabled, isLoading }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

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
            if (value.trim() && !isDisabled) {
                formRef.current?.requestSubmit();
            }
        }
    };

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className="w-full pt-[6px] pr-[16px] pb-[14px] pl-[16px] mt-auto">
                <div
                    className={cn(
                        'py-[6px] px-[10px] w-full border border-[#EAEAEC] dark:border-[#3A3C40] rounded-lg overflow-hidden transition-all duration-200 focus-within:border-[#7932FF] dark:focus-within:border-[#7932FF]'
                    )}
                >
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="AI에게 무엇이든 물어보세요"
                        className="w-full max-h-[231px] overflow-auto resize-none outline-none bg-transparent"
                        value={value}
                        onChange={onChange}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={isDisabled}
                    />

                    <div className="flex items-center justify-between mt-[6px]">
                        <div className="flex items-center gap-[10px]">
                            <Button variant="ghost" className="h-auto p-[2px] group">
                                <Paperclip className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                            </Button>
                        </div>
                        <button disabled={!value.trim() || isDisabled}>
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                            ) : (
                                <SendHorizontal
                                    className="w-[18px] h-[18px]"
                                    fill={value.trim() && !isDisabled ? '#8F19F6' : '#CFD0D3'}
                                    stroke={value.trim() && !isDisabled ? '#8F19F6' : '#CFD0D3'}
                                />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};
