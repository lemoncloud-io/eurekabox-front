import { Ellipsis } from 'lucide-react';

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
    AlertDialogTrigger,
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

import type { Conversation } from '../../types';

interface ConversationItemProps {
    conversation: Conversation;
    onDelete: () => void;
    onTogglePin: () => void;
    isPinned: boolean;
}

export const ConversationItem = ({ conversation, onDelete, onTogglePin, isPinned }: ConversationItemProps) => {
    const { isDarkTheme } = useTheme();

    return (
        <li className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] max-h-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-[9px] flex-1 min-w-0">
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
                    {conversation.title}
                </div>
            </div>

            <DropdownMenu>
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
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-xs text-[#F34822]" onSelect={e => e.preventDefault()}>
                                삭제
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>채팅을 삭제하시겠습니까?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription className="text-center">
                                삭제한 채팅은 복구가 불가합니다.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </li>
    );
};
