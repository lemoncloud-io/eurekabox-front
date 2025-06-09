import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Info } from 'lucide-react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type { BrainView, ChatBody, EmbeddingView, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import { usePrompts } from '@eurekabox/agents';
import { chatbotsKeys, useBrains, useCreateChildChats, useEmbeddings } from '@eurekabox/chatbots';
import type { BulkCreateChildBotsBody } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Badge } from '@eurekabox/ui-kit/components/ui/badge';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@eurekabox/ui-kit/components/ui/card';
import { Checkbox } from '@eurekabox/ui-kit/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@eurekabox/ui-kit/components/ui/popover';

import { PromptDetailDialog } from './PromptDetailDialog';

interface ModelSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    forceOpen?: boolean;
}

const SkeletonItem: React.FC = () => (
    <div className="flex items-center space-x-2 animate-pulse">
        <div className="h-4 w-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded flex-1"></div>
        <div className="h-4 w-4 bg-muted rounded"></div>
    </div>
);

const LoadingCard: React.FC<{ title: string; helpText: string; itemCount?: number }> = ({
    title,
    helpText,
    itemCount = 3,
}) => (
    <Card className="border border-border p-0">
        <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Popover>
                    <PopoverTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </PopoverTrigger>
                    <PopoverContent className="w-[260px] p-3">
                        <p className="text-sm">{helpText}</p>
                    </PopoverContent>
                </Popover>
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            {Array.from({ length: itemCount }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </CardContent>
    </Card>
);

export const ModelSelectionDialog: React.FC<ModelSelectionDialogProps> = ({ open, onClose, forceOpen }) => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: embeddingsData, isLoading: isLoadingEmbeddings } = useEmbeddings({});
    const { data: brainsData, isLoading: isLoadingBrains } = useBrains({});
    const { data: systemPromptsData, isLoading: isLoadingSystemPrompts } = usePrompts({ stereo: 'system' });
    const { data: userPromptsData, isLoading: isLoadingUserPrompts } = usePrompts({ stereo: 'user' });

    const createChildChats = useCreateChildChats();

    const [selectedEmbeddings, setSelectedEmbeddings] = useState<EmbeddingView[]>([]);
    const [selectedChatModels, setSelectedChatModels] = useState<BrainView[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<PromptView[]>([]);
    const [selectedUserPrompts, setSelectedUserPrompts] = useState<PromptView[]>([]);
    const [viewingPrompt, setViewingPrompt] = useState<PromptView | null>(null);

    const isAnyLoading = isLoadingEmbeddings || isLoadingBrains || isLoadingSystemPrompts || isLoadingUserPrompts;

    const combinations = useMemo(() => {
        const combos: Array<{
            embeddingId: string;
            embeddingName: string;
            brainId: string;
            brainName: string;
            promptId: string;
            promptName: string;
            userPromptId: string;
            userPromptName: string;
        }> = [];

        selectedEmbeddings.forEach(embedding => {
            selectedChatModels.forEach(brain => {
                selectedPrompts.forEach(prompt => {
                    selectedUserPrompts.forEach(userPrompt => {
                        combos.push({
                            embeddingId: embedding.id,
                            embeddingName: embedding.name,
                            brainId: brain.id,
                            brainName: brain.name,
                            promptId: prompt.id,
                            promptName: prompt.name,
                            userPromptId: userPrompt.id,
                            userPromptName: userPrompt.name,
                        });
                    });
                });
            });
        });

        return combos;
    }, [selectedEmbeddings, selectedChatModels, selectedPrompts, selectedUserPrompts]);

    const handleEmbeddingChange = (embedding: EmbeddingView) => {
        setSelectedEmbeddings(prev =>
            prev.find(m => m.id === embedding.id) ? prev.filter(m => m.id !== embedding.id) : [...prev, embedding]
        );
    };

    const handleChatModelChange = (brain: BrainView) => {
        setSelectedChatModels(prev =>
            prev.find(m => m.id === brain.id) ? prev.filter(m => m.id !== brain.id) : [...prev, brain]
        );
    };

    const handlePromptChange = (prompt: PromptView) => {
        setSelectedPrompts(prev =>
            prev.find(p => p.id === prompt.id) ? prev.filter(p => p.id !== prompt.id) : [...prev, prompt]
        );
    };

    const handleUserPromptChange = (prompt: PromptView) => {
        setSelectedUserPrompts(prev =>
            prev.find(p => p.id === prompt.id) ? prev.filter(p => p.id !== prompt.id) : [...prev, prompt]
        );
    };

    const resetAllSelections = () => {
        setSelectedEmbeddings([]);
        setSelectedChatModels([]);
        setSelectedPrompts([]);
        setSelectedUserPrompts([]);
    };

    const handleSubmit = async () => {
        try {
            const list: ChatBody[] = combinations.map(combo => ({
                stereo: 'group',
                embeddingId: combo.embeddingId,
                brainId: combo.brainId,
                promptId: combo.promptId,
                userPromptId: combo.userPromptId,
            }));

            await createChildChats.mutateAsync({ rootId: id, list } as BulkCreateChildBotsBody, {
                onSuccess: async () => {
                    await createAsyncDelay(1000);
                    await queryClient.invalidateQueries(chatbotsKeys.invalidateList());
                    toast({ title: t('ai.model.success_message') });
                    onClose?.();
                    resetAllSelections();
                },
            });
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const handleCancel = () => {
        if (forceOpen) {
            resetAllSelections();
            onClose();
            navigate(-1);
        } else {
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={forceOpen || open}
                onOpenChange={isOpen => {
                    if (!forceOpen && !isOpen) {
                        onClose();
                    }
                }}
            >
                <DialogContent className="max-w-[600px] pt-0 flex flex-col">
                    <div className="bg-dialog shrink-0 h-[52px] sticky top-0 z-[1000] flex items-center justify-center shadow-custom">
                        <DialogTitle>{t('ai.model.dialog_title')}</DialogTitle>
                    </div>
                    <div className="p-6 overflow-auto grid gap-4 flex-1">
                        {/* Embeddings */}
                        {isLoadingEmbeddings ? (
                            <LoadingCard
                                title={t('ai.model.embedding.title')}
                                helpText={t('ai.model.embedding.description')}
                                itemCount={2}
                            />
                        ) : (
                            <Card className="border border-border p-0">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('ai.model.embedding.title')}
                                        </CardTitle>
                                        <Popover>
                                            <PopoverTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[260px] p-3">
                                                <p className="text-sm">{t('ai.model.embedding.description')}</p>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {embeddingsData?.data.map(embedding => (
                                        <div key={`embedding_${embedding.id}`} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`embedding-${embedding.id}`}
                                                checked={selectedEmbeddings.some(m => m.id === embedding.id)}
                                                onCheckedChange={() => handleEmbeddingChange(embedding)}
                                            />
                                            <label htmlFor={`embedding-${embedding.id}`}>{embedding.name}</label>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Chat Models */}
                        {isLoadingBrains ? (
                            <LoadingCard
                                title={t('ai.model.chat.title')}
                                helpText={t('ai.model.chat.description')}
                                itemCount={3}
                            />
                        ) : (
                            <Card className="border border-border p-0">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('ai.model.chat.title')}
                                        </CardTitle>
                                        <Popover>
                                            <PopoverTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[260px] p-3">
                                                <p className="text-sm">{t('ai.model.chat.description')}</p>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {brainsData?.data.map(brain => (
                                        <div key={`brain_${brain.id}`} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`brain-${brain.id}`}
                                                checked={selectedChatModels.includes(brain)}
                                                onCheckedChange={() => handleChatModelChange(brain)}
                                            />
                                            <label htmlFor={`brain-${brain.id}`}>{brain.name}</label>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* System Prompts */}
                        {isLoadingSystemPrompts ? (
                            <LoadingCard
                                title={t('ai.model.system_prompt.title')}
                                helpText={t('ai.model.system_prompt.description')}
                                itemCount={2}
                            />
                        ) : (
                            <Card className="border border-border p-0">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('ai.model.system_prompt.title')}
                                        </CardTitle>
                                        <Popover>
                                            <PopoverTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[260px] p-3">
                                                <p className="text-sm">{t('ai.model.system_prompt.description')}</p>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {systemPromptsData?.data.map(prompt => (
                                        <div key={`prompt_${prompt.id}`} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`prompt-${prompt.id}`}
                                                checked={selectedPrompts.includes(prompt)}
                                                onCheckedChange={() => handlePromptChange(prompt)}
                                            />
                                            <label htmlFor={`prompt-${prompt.id}`} className="flex-1">
                                                {prompt.name}
                                            </label>
                                            <Info
                                                className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                onClick={() => setViewingPrompt(prompt)}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* User Prompts */}
                        {isLoadingUserPrompts ? (
                            <LoadingCard
                                title={t('ai.model.user_prompt.title')}
                                helpText={t('ai.model.user_prompt.description')}
                                itemCount={2}
                            />
                        ) : (
                            <Card className="border border-border p-0">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('ai.model.user_prompt.title')}
                                        </CardTitle>
                                        <Popover>
                                            <PopoverTrigger>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[260px] p-3">
                                                <p className="text-sm">{t('ai.model.user_prompt.description')}</p>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {userPromptsData?.data.map(prompt => (
                                        <div key={`userprompt_${prompt.id}`} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`userprompt_-${prompt.id}`}
                                                checked={selectedUserPrompts.includes(prompt)}
                                                onCheckedChange={() => handleUserPromptChange(prompt)}
                                            />
                                            <label htmlFor={`userprompt_-${prompt.id}`} className="flex-1">
                                                {prompt.name}
                                            </label>
                                            <Info
                                                className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                onClick={() => setViewingPrompt(prompt)}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <div className="p-6 pb-0 mt-auto">
                        <Card className="border border-border p-0">
                            <CardHeader className="pb-2 mb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('ai.model.combinations')} ({combinations.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 max-h-[250px] overflow-auto">
                                {combinations.map((combo, index) => (
                                    <div key={index} className="text-sm flex items-center gap-2">
                                        <Badge variant="secondary">{combo.embeddingName}</Badge> +
                                        <Badge variant="secondary">{combo.brainName}</Badge> +
                                        <Badge variant="secondary">{combo.promptName} (S)</Badge> +
                                        <Badge variant="secondary">{combo.userPromptName} (U)</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <div className="mt-10 flex items-center justify-center gap-2">
                            <Button
                                className="flex-1"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={createChildChats.isPending}
                            >
                                {t('ai.model.cancel')}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    isAnyLoading ||
                                    !combinations ||
                                    combinations.length === 0 ||
                                    createChildChats.isPending
                                }
                                className="flex-1"
                            >
                                {createChildChats.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    </div>
                                ) : (
                                    t('ai.model.create')
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PromptDetailDialog prompt={viewingPrompt} open={!!viewingPrompt} onClose={() => setViewingPrompt(null)} />
        </>
    );
};
