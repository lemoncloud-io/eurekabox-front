import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { MonitorSmartphone, MoreVertical, Pencil, Trash } from 'lucide-react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { chatbotsKeys, useBrains, useEmbeddings, usePrompts, useUpdateChat } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@eurekabox/ui-kit/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@eurekabox/ui-kit/components/ui/dropdown-menu';
import { Input } from '@eurekabox/ui-kit/components/ui/input';
import { Label } from '@eurekabox/ui-kit/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eurekabox/ui-kit/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/ui-kit/components/ui/tooltip';

import { ChatWindow } from './ChatWindow';

interface ChatCardProps {
    chat: ChatView;
    index: number;
    isSending: boolean;
    onDelete: (chatId: string) => void;
    onScroll: (index: number, event: React.UIEvent<HTMLDivElement>) => void;
    scrollRef: (el: HTMLDivElement | null) => void;
    cardHeight: string;
}

export const ChatCard = ({ chat, index, isSending, onDelete, onScroll, scrollRef, cardHeight }: ChatCardProps) => {
    const queryClient = useQueryClient();

    const { data: embeddingsData } = useEmbeddings({ limit: -1 });
    const { data: brainsData } = useBrains({ limit: -1 });
    const { data: promptsData } = usePrompts({ limit: -1 });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        embeddingId: chat.embeddingId,
        brainId: chat.brainId,
        promptId: chat.promptId,
        name: chat.name || '',
    });

    const updateChat = useUpdateChat();

    const handleUpdateChat = async () => {
        try {
            await updateChat.mutateAsync({
                chatId: chat.id,
                name: editForm.name,
                embeddingId: editForm.embeddingId,
                brainId: editForm.brainId,
                promptId: editForm.promptId,
            });

            queryClient.setQueryData(chatbotsKeys.list({ rootId: chat.parentId, limit: 20 }), (oldData: any) => {
                if (!oldData) {
                    return oldData;
                }

                return {
                    ...oldData,
                    data: oldData.data.map((item: ChatView) =>
                        item.id === chat.id
                            ? {
                                  ...item,
                                  name: editForm.name,
                                  embedding: editForm.embeddingId,
                                  chatType: editForm.brainId,
                                  prompt: editForm.promptId,
                              }
                            : item
                    ),
                };
            });

            setIsEditDialogOpen(false);
            toast({ title: 'Chat updated successfully' });
        } catch (error) {
            toast({ title: 'Failed to update chat' });
        }
    };

    const formatBrainName = (name: string | undefined) => {
        if (!name) {
            return '';
        }
        return name.replace('gpt-', 'g'); // 'g4' for gpt-4
    };

    const formatPromptName = (name: string | undefined) => {
        if (!name) {
            return '';
        }
        return name.replace('prompt', 'p'); // 'p3' for prompt3
    };

    const formatEmbeddingName = (name: string | undefined) => {
        if (!name) {
            return '';
        }
        const parts = name.split('-');
        return parts
            .slice(0, -1)
            .map(part => part[0])
            .concat(parts[parts.length - 1])
            .join('-');
    };

    return (
        <>
            <Card
                className={`flex flex-col p-0 border bg-chatbot-card border-[#EAEAEC] dark:border-[#3A3C40] ${cardHeight}`}
            >
                <CardHeader className="py-2 pl-4 pr-2">
                    <CardTitle className="flex-1 text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center">
                            <MonitorSmartphone className="h-5 w-5 mr-2" />
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger className="hover:cursor-help">
                                        <span className="inline-flex items-center gap-1.5 max-w-[300px] truncate">
                                            {/* <span className="text-muted-foreground shrink-0">·</span> */}
                                            <span className="whitespace-nowrap">
                                                {formatPromptName(chat.prompt$?.name) || 'np'} ·{' '}
                                                {formatBrainName(chat.brain$?.name) || 'nb'} ·{' '}
                                                {formatEmbeddingName(chat.embedding$?.name)}
                                            </span>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-[300px]">
                                        <div className="space-y-1">
                                            <p className="text-xs text-yellow-400">
                                                <span className="font-medium text-foreground">Prompt:</span>{' '}
                                                {chat.prompt$?.name}
                                            </p>
                                            <p className="text-xs text-pink-400">
                                                <span className="font-medium text-foreground">Brain:</span>{' '}
                                                {chat.brain$?.name}
                                            </p>
                                            <p className="text-xs text-green-400">
                                                <span className="font-medium text-foreground">Embedding:</span>{' '}
                                                {chat.embedding$?.name}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Pencil className="h-4 w-4 mr-1" />
                                    수정
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(chat.id)}>
                                    <Trash className="h-4 w-4 mr-1 text-destructive" />
                                    <span className="text-destructive">삭제</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardTitle>
                </CardHeader>
                <CardContent
                    ref={scrollRef}
                    onScroll={e => onScroll(index, e)}
                    className="p-1 text-sm overflow-y-auto space-y-4"
                    style={{ height: `calc(100% - 56px)` }}
                >
                    <ChatWindow chat={chat} onScroll={onScroll} index={index} isSending={isSending} />
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogTitle className="text-center">{chat.name || `Chat #${chat.id}`} 수정</DialogTitle>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editForm.name}
                                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter chat name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Embedding Model</Label>
                            <Select
                                disabled
                                value={editForm.embeddingId}
                                onValueChange={value => setEditForm(prev => ({ ...prev, embeddingId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select embedding model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {embeddingsData?.data.map(embedding => (
                                        <SelectItem key={embedding.id} value={embedding.id}>
                                            {embedding.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Chat Type</Label>
                            <Select
                                disabled
                                value={editForm.brainId}
                                onValueChange={value => setEditForm(prev => ({ ...prev, brainId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select chat type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brainsData?.data.map(brain => (
                                        <SelectItem key={brain.id} value={brain.id}>
                                            {brain.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Prompt</Label>
                            <Select
                                disabled
                                value={editForm.promptId}
                                onValueChange={value => setEditForm(prev => ({ ...prev, promptId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select prompt" />
                                </SelectTrigger>
                                <SelectContent>
                                    {promptsData?.data.map(prompt => (
                                        <SelectItem key={prompt.id} value={prompt.id}>
                                            {prompt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-center items-center mt-10">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={updateChat.isPending}
                        >
                            취소
                        </Button>
                        <Button onClick={handleUpdateChat} disabled={updateChat.isPending} size="lg">
                            {updateChat.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                '수정'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
