import { EllipsisVertical, X } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';

interface ChatHeaderProps {
    modelName: string;
    onClose: () => void;
    onNewChat: () => void;
    onTestChat: () => void;
    onPricing: () => void;
}

export const ChatHeader = ({ modelName, onClose, onNewChat, onTestChat, onPricing }: ChatHeaderProps) => {
    return (
        <header className="py-[10px] px-3 flex items-center justify-between sticky top-0">
            <div className="text-sm font-medium">{modelName}</div>
            <div className="flex items-center gap-[10px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-[2px] group">
                            <EllipsisVertical className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[100px] px-3 bg-chatbot-card">
                        <DropdownMenuItem className="text-xs" onClick={onNewChat}>
                            새채팅 모달
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                        <DropdownMenuItem onClick={onTestChat} className="text-xs">
                            채팅 테스트
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                        <DropdownMenuItem onClick={onPricing} className="text-xs">
                            비용 안내
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" className="h-auto p-[2px] group" onClick={onClose}>
                    <X className="w-[18px] h-[18px] text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                </Button>
            </div>
        </header>
    );
};
