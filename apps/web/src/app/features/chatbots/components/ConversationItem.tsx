import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
            <li className="relative p-[6px] text-xs rounded-[5px] max-h-10 flex items-center justify-between gap-2 transition-all duration-200 text-text-800 bg-white dark:bg-[#02060E] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
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
                        {conversation.name || t('conversation.new_chat')}
                    </div>

                    {isCurrentChat && <Check className="w-4 h-4 text-[#7932FF] dark:text-[#8F19F6] shrink-0" />}
                </div>

                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-[2px] h-auto group shrink-0">
                            <Ellipsis className="text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="px-3 bg-chatbot-card">
                        <DropdownMenuItem className="text-xs" onClick={onTogglePin}>
                            {isPinned ? t('conversation.unpin') : t('conversation.pin')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                        <DropdownMenuItem className="text-xs text-destructive" onClick={handleDeleteClick}>
                            {t('common.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </li>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('conversation.delete_confirmation_title')}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="text-center">
                        {t('conversation.delete_confirmation_description')}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
