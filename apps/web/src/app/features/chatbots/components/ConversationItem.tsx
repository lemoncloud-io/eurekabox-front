import { useState } from 'react';

import { Check, Ellipsis } from 'lucide-react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Images } from '@eurekabox/assets';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@eurekabox/lib/components/ui/alert-dialog';
import { Button } from '@eurekabox/lib/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { useTheme } from '@eurekabox/theme';

interface ConversationItemProps {
    conversation: ChatView;
    onDelete: () => void;
    onTogglePin: () => void;
    onConversationClick: () => void;
    isCurrentChat: boolean;
    isPinned: boolean;
    isDisabled?: boolean;
}

export const ConversationItem = ({
    conversation,
    onDelete,
    onTogglePin,
    onConversationClick,
    isCurrentChat,
    isDisabled = false,
    isPinned,
}: ConversationItemProps) => {
    const { isDarkTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteClick = () => {
        setDropdownOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setDeleteDialogOpen(false);
    };

    const handleConversationClick = (e: React.MouseEvent) => {
        if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onConversationClick();
    };

    return (
        <>
            <li
                className={`relative p-[6px] text-xs rounded-[5px] max-h-10 flex items-center justify-between gap-2 transition-all duration-200 ${
                    isCurrentChat
                        ? 'bg-[#F8F9FA] dark:bg-[#2A2D31] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[2px] after:h-4 after:bg-[#7932FF] after:rounded-full'
                        : 'text-text-800 bg-white dark:bg-[#02060E] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                }`}
            >
                <div
                    className="flex items-center gap-[9px] flex-1 min-w-0 cursor-pointer"
                    onClick={handleConversationClick}
                    aria-disabled={isDisabled}
                >
                    {isPinned && (
                        <img
                            src={isDarkTheme ? Images.notice : Images.notice}
                            alt="pinned icon"
                            className="w-[17px] h-[17px] shrink-0"
                        />
                    )}
                    <div
                        className="line-clamp-2 text-xs flex-1"
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {conversation.name || '새 대화'}
                    </div>

                    {isCurrentChat && <Check className="w-3 h-3 text-[#7932FF] shrink-0" />}
                </div>

                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-[2px] h-auto group shrink-0">
                            <Ellipsis className="text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[100px] px-3 bg-chatbot-card">
                        <DropdownMenuItem className="text-xs" onClick={onTogglePin}>
                            {isPinned ? '고정해제' : '고정'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                        <DropdownMenuItem className="text-xs text-[#F34822]" onClick={handleDeleteClick}>
                            삭제
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </li>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>채팅을 삭제하시겠습니까?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="text-center">
                        삭제한 채팅은 복구가 불가합니다.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
