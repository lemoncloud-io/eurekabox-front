import { useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Edit2, ScrollText } from 'lucide-react';

import type { PromptView } from '@lemoncloud/ssocio-chatbots-api';

import { promptKeys, usePrompts, useUpdatePrompt } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@eurekabox/ui-kit/components/ui/dropdown-menu';
import { Textarea } from '@eurekabox/ui-kit/components/ui/textarea';



export const PromptSettings = () => {
    const queryClient = useQueryClient();
    const { setIsLoading } = useGlobalLoader();

    const [selectedPrompt, setSelectedPrompt] = useState<PromptView | null>(null);
    const [editingPrompt, setEditingPrompt] = useState<PromptView | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingText, setEditingText] = useState('');

    const { data: promptsData, isLoading, error, refetch } = usePrompts({ limit: -1 });
    const updatePrompt = useUpdatePrompt();

    const groupedPrompts = useMemo(() => {
        if (!promptsData?.data) {
            return { system: [], user: [] };
        }

        return promptsData.data.reduce(
            (acc, prompt) => {
                if (prompt.stereo === 'system') {
                    acc.system.push(prompt);
                }
                if (prompt.stereo === 'user') {
                    acc.user.push(prompt);
                }
                return acc;
            },
            { system: [] as PromptView[], user: [] as PromptView[] }
        );
    }, [promptsData?.data]);

    useEffect(() => {
        setIsLoading(isLoading);
        if (error) {
            toast({ title: '프롬프트 목록을 불러오는데 실패했습니다.' });
        }
    }, [isLoading, error, setIsLoading]);

    const handleEdit = (prompt: PromptView, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPrompt(prompt);
        setEditingText(prompt.contents?.join('\n') || '');
        setEditingName(prompt.name || '');
    };

    const handleSave = async () => {
        if (!editingPrompt || !editingPrompt.id) {
            return;
        }

        try {
            await updatePrompt.mutateAsync(
                {
                    promptId: editingPrompt.id,
                    name: editingName,
                    contents: editingText.split('\n'),
                },
                {
                    onSuccess: async (updated: PromptView) => {
                        queryClient.setQueryData(promptKeys.list({ limit: -1 }), (oldData: any) => ({
                            ...oldData,
                            data: oldData.data.map((prompt: PromptView) =>
                                prompt.id === editingPrompt.id ? updated : prompt
                            ),
                        }));
                        toast({ title: '프롬프트가 수정되었습니다.' });
                        setEditingPrompt(null);
                    },
                }
            );
        } catch (error) {
            toast({ title: '프롬프트 수정에 실패했습니다.' });
        }
    };

    if (error) {
        return (
            <Button variant="outline" onClick={() => refetch()} className="w-full">
                <ScrollText className="h-4 w-4 mr-2" />
                프롬프트 다시 불러오기
            </Button>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center text-sm">
                            <ScrollText className="h-4 w-4 mr-2" />
                            프롬프트
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    {isLoading ? (
                        <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : promptsData?.data?.length === 0 ? (
                        <DropdownMenuItem disabled>No Prompts found</DropdownMenuItem>
                    ) : (
                        <>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                시스템 프롬프트
                            </div>
                            {groupedPrompts.system.map(prompt => (
                                <DropdownMenuItem key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                    <div className="py-[2px] px-2 flex items-center justify-between w-full">
                                        <span>{prompt.name || 'Untitled'}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={e => handleEdit(prompt, e)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                                유저 프롬프트
                            </div>
                            {groupedPrompts.user.map(prompt => (
                                <DropdownMenuItem key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                    <div className="py-[2px] px-2 flex items-center justify-between w-full">
                                        <span>{prompt.name || 'Untitled'}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={e => handleEdit(prompt, e)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add new Edit Dialog */}
            <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
                <DialogContent>
                    <DialogTitle className="flex items-center gap-2 group px-6">
                        <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            className="bg-transparent w-full text-center text-xl font-semibold focus:outline-none border-b border-transparent hover:border-border focus:border-gray-300 transition-colors"
                            placeholder="Untitled Prompt"
                        />
                        <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </DialogTitle>
                    <div className="py-6 px-4">
                        <Textarea
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            className="min-h-[600px] font-mono text-sm border"
                        />
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setEditingPrompt(null)}
                            disabled={updatePrompt.isPending}
                            className="flex-1"
                        >
                            취소
                        </Button>
                        <Button onClick={handleSave} disabled={updatePrompt.isPending} className="flex-1">
                            {updatePrompt.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                '저장'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
                <DialogContent showCloseButton={false} className="pt-0">
                    <DialogHeader>
                        <DialogTitle>{selectedPrompt?.name || 'Untitled Prompt'}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 overflow-auto">
                        <div className="whitespace-pre-wrap text-sm">{selectedPrompt?.contents?.join('\n')}</div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
