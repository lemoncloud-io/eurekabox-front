import { Send } from 'lucide-react';

import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Input } from '@eurekabox/ui-kit/components/ui/input';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isDisabled: boolean;
    isLoading: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isDisabled, isLoading }: ChatInputProps) => {
    return (
        <form onSubmit={onSubmit} className="w-full flex items-center gap-2">
            <Input
                className="w-full"
                value={value}
                onChange={onChange}
                placeholder="어떤 도움이 필요하세요?"
                disabled={isDisabled}
            />
            <Button className="shrink-0" type="submit" size="icon" disabled={isDisabled || !value.trim()}>
                {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
            </Button>
        </form>
    );
};
