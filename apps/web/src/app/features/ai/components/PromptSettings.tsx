import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
            toast({ title: t('ai.prompt.load_error') });
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
                        toast({ title: t('ai.prompt.update_success') });
                        setEditingPrompt(null);
                    },
                }
            );
        } catch (error) {
            toast({ title: t('ai.prompt.update_error') });
        }
    };

    if (error) {
        return (
            <Button variant="outline" onClick={() => refetch()} className="w-full">
                <ScrollText className="h-4 w-4 mr-2" />
                {t('ai.prompt.reload')}
            </Button>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background">
                        <div className="flex items-center text-sm">
                            <ScrollText className="h-4 w-4 mr-2" />
                            {t('ai.prompt.title')}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    {isLoading ? (
                        <DropdownMenuItem disabled>{t('common.loading')}</DropdownMenuItem>
                    ) : promptsData?.data?.length === 0 ? (
                        <DropdownMenuItem disabled>{t('ai.prompt.no_prompts')}</DropdownMenuItem>
                    ) : (
                        <>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                {t('ai.prompt.system_prompt')}
                            </div>
                            {groupedPrompts.system.map(prompt => (
                                <DropdownMenuItem key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                    <div className="py-[2px] px-2 flex items-center justify-between w-full">
                                        <span>{prompt.name || t('ai.prompt.untitled')}</span>
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
                                {t('ai.prompt.user_prompt')}
                            </div>
                            {groupedPrompts.user.map(prompt => (
                                <DropdownMenuItem key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                    <div className="py-[2px] px-2 flex items-center justify-between w-full">
                                        <span>{prompt.name || t('ai.prompt.untitled')}</span>
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
                            placeholder={t('ai.prompt.untitled')}
                        />
                        <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </DialogTitle>
                    <Textarea
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        className="min-h-[600px] font-mono text-sm border"
                    />
                    <div className="flex items-center gap-2 justify-center">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setEditingPrompt(null)}
                            disabled={updatePrompt.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={updatePrompt.isPending} size="lg">
                            {updatePrompt.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                t('common.save')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
                <DialogContent className="p-0">
                    <DialogHeader>
                        <DialogTitle>{selectedPrompt?.name || t('ai.prompt.untitled')}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto p-[18px] pt-0">
                        <div className="whitespace-pre-wrap text-sm">{selectedPrompt?.contents?.join('\n')}</div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
