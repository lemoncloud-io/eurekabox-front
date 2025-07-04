import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type {
    BrainView,
    ChatBody,
    ChatUserProfile,
    ChatView,
    EmbeddingView,
    PromptView,
} from '@lemoncloud/ssocio-chatbots-api';

import { usePrompts } from '@eurekabox/agents';
import type { BulkCreateChildBotsBody } from '@eurekabox/chatbots';
import {
    chatbotsKeys,
    rootChatbotsKeys,
    useBrains,
    useCreateChildChats,
    useCreateRootChat,
    useEmbeddings,
} from '@eurekabox/chatbots';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';

export const TestChatSelectModal = ({
    open,
    onOpenChange,
    newChatName,
    closeChatbot,
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    newChatName?: string;
    closeChatbot?: () => void;
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { profile } = useWebCoreStore();
    const navigate = useNavigate();

    // Data fetching hooks
    const { data: embeddingsData } = useEmbeddings({});
    const { data: brainsData } = useBrains({});
    const { data: systemPromptsData } = usePrompts({ stereo: 'system' });
    const { data: userPromptsData } = usePrompts({ stereo: 'user' });

    const createRootChat = useCreateRootChat();
    const createChildChats = useCreateChildChats();

    // State management
    const [selectedEmbeddings, setSelectedEmbeddings] = useState<EmbeddingView[]>([]);
    const [selectedChatModels, setSelectedChatModels] = useState<BrainView[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<PromptView[]>([]);
    const [selectedUserPrompts, setSelectedUserPrompts] = useState<PromptView[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Combinations calculation
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
            setIsLoading(true);

            // Phase 1: Create root chat
            const profile$: ChatUserProfile = {
                ...(profile?.sid && { sid: profile.sid }),
                ...(profile?.uid && { uid: profile.uid }),
                ...(profile?.$user?.gender && { gender: profile?.$user?.gender }),
                ...(profile?.$user?.name && { name: profile?.$user?.name }),
            };

            await createRootChat.mutateAsync(
                { name: newChatName, profile$ },
                {
                    onSuccess: async (newChat: ChatView) => {
                        // Phase 2: Create child chats using the new chat ID
                        const list: ChatBody[] = combinations.map(combo => ({
                            stereo: 'group',
                            embeddingId: combo.embeddingId,
                            brainId: combo.brainId,
                            promptId: combo.promptId,
                            userPromptId: combo.userPromptId,
                        }));

                        await createChildChats.mutateAsync({ rootId: newChat.id, list } as BulkCreateChildBotsBody, {
                            onSuccess: async () => {
                                await createAsyncDelay(200);
                                await queryClient.invalidateQueries(rootChatbotsKeys.invalidateList());
                                await queryClient.invalidateQueries(chatbotsKeys.invalidateList());
                                toast({ title: t('testChatModal.chat_group_created_success') });
                                onOpenChange(false);
                                resetAllSelections();
                                navigate(`/ai/chat/${newChat.id}`);
                                closeChatbot();
                            },
                        });
                    },
                }
            );
        } catch (error) {
            console.error('Failed to create chat:', error);
            toast({
                title: t('testChatModal.chat_creation_failed'),
                description: t('testChatModal.chat_creation_error'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        resetAllSelections();
        onOpenChange(false);
    };

    const isPending = isLoading || createRootChat.isPending || createChildChats.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <DialogHeader>
                    <DialogTitle>{t('testChatModal.title')}</DialogTitle>
                </DialogHeader>
                <div className="px-[18px] overflow-auto">
                    <div className="text-[18px] font-medium mb-7">
                        {t('testChatModal.description_line1')}
                        <br />
                        {t('testChatModal.description_line2')}
                    </div>

                    {/* 임베딩 모델 */}
                    <div className="text-base font-medium mb-[2px]">{t('testChatModal.embedding_model.title')}</div>
                    <div className="text-xs text-text-700">
                        {t('testChatModal.embedding_model.description_line1')}
                        <br />
                        {t('testChatModal.embedding_model.description_line2')}
                    </div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        {embeddingsData?.data.map(embedding => {
                            const isSelected = selectedEmbeddings.some(m => m.id === embedding.id);
                            return (
                                <button
                                    key={embedding.id}
                                    onClick={() => handleEmbeddingChange(embedding)}
                                    className={`flex items-center justify-between h-[41px] border rounded-lg py-[10px] px-[14px] text-left transition-colors ${
                                        isSelected
                                            ? 'border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325]'
                                            : 'border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] hover:border-[#3A3C40] hover:dark:border-[#BABCC0]'
                                    }`}
                                >
                                    <div className={isSelected ? '' : 'text-[#84888F]'}>{embedding.name}</div>
                                    {isSelected && <Check className="w-[18px] h-[18px] text-[#8F19F6]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>

                    {/* 시스템 프롬프트 */}
                    <div className="text-base font-medium mb-[2px]">{t('testChatModal.system_prompt.title')}</div>
                    <div className="text-xs text-text-700">{t('testChatModal.system_prompt.description')}</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        {systemPromptsData?.data.map(prompt => {
                            const isSelected = selectedPrompts.some(p => p.id === prompt.id);
                            return (
                                <button
                                    key={prompt.id}
                                    onClick={() => handlePromptChange(prompt)}
                                    className={`flex items-center justify-between h-[41px] border rounded-lg py-[10px] px-[14px] text-left transition-colors ${
                                        isSelected
                                            ? 'border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325]'
                                            : 'border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] hover:border-[#3A3C40] hover:dark:border-[#BABCC0]'
                                    }`}
                                >
                                    <div className={isSelected ? '' : 'text-[#84888F]'}>{prompt.name}</div>
                                    {isSelected && <Check className="w-[18px] h-[18px] text-[#8F19F6]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>

                    {/* 채팅 모델 */}
                    <div className="text-base font-medium mb-[2px]">{t('testChatModal.chat_model.title')}</div>
                    <div className="text-xs text-text-700">{t('testChatModal.chat_model.description')}</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        {brainsData?.data.map(brain => {
                            const isSelected = selectedChatModels.some(m => m.id === brain.id);
                            return (
                                <button
                                    key={brain.id}
                                    onClick={() => handleChatModelChange(brain)}
                                    className={`flex items-center justify-between h-[41px] border rounded-lg py-[10px] px-[14px] text-left transition-colors ${
                                        isSelected
                                            ? 'border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325]'
                                            : 'border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] hover:border-[#3A3C40] hover:dark:border-[#BABCC0]'
                                    }`}
                                >
                                    <div className={isSelected ? '' : 'text-[#84888F]'}>{brain.name}</div>
                                    {isSelected && <Check className="w-[18px] h-[18px] text-[#8F19F6]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>

                    {/* 사용자 프롬프트 */}
                    <div className="text-base font-medium mb-[2px]">{t('testChatModal.user_prompt.title')}</div>
                    <div className="text-xs text-text-700">{t('testChatModal.user_prompt.description')}</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        {userPromptsData?.data.map(prompt => {
                            const isSelected = selectedUserPrompts.some(p => p.id === prompt.id);
                            return (
                                <button
                                    key={prompt.id}
                                    onClick={() => handleUserPromptChange(prompt)}
                                    className={`flex items-center justify-between h-[41px] border rounded-lg py-[10px] px-[14px] text-left transition-colors ${
                                        isSelected
                                            ? 'border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325]'
                                            : 'border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] hover:border-[#3A3C40] hover:dark:border-[#BABCC0]'
                                    }`}
                                >
                                    <div className={isSelected ? '' : 'text-[#84888F]'}>{prompt.name}</div>
                                    {isSelected && <Check className="w-[18px] h-[18px] text-[#8F19F6]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pb-4 pt-[10px] px-4 bg-popup border-t border-[#BABCC0] dark:border-[#53555B]">
                    {combinations.length === 0 ? (
                        <div className="text-text-800 pb-[19px] pt-[18px] text-center">
                            {t('testChatModal.no_combinations_line1')}
                            <br />
                            {t('testChatModal.no_combinations_line2')}
                        </div>
                    ) : (
                        ''
                    )}
                    {combinations.length > 0 && (
                        <div>
                            <div className="font-medium mb-[10px]">
                                {t('testChatModal.selected_combinations', { count: combinations.length })}
                            </div>
                            <div className="flex flex-col space-y-1 overflow-auto max-h-[140px]">
                                {combinations.map((combo, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#F4F5F5] dark:bg-[#222325] py-[10px] px-[14px] text-xs rounded-lg"
                                    >
                                        <div>・ {combo.embeddingName}</div>
                                        <div>・ {combo.brainName}</div>
                                        <div>・ {combo.promptName}</div>
                                        <div>・ {combo.userPromptName}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2 pt-[9px]">
                        <Button variant="outline" size="lg" onClick={handleCancel} disabled={isPending}>
                            {t('common.cancel')}
                        </Button>
                        <Button size="lg" disabled={combinations.length === 0 || isPending} onClick={handleSubmit}>
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                t('common.create')
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
