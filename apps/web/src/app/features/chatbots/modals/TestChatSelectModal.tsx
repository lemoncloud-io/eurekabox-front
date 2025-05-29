import React, { useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type {
    BrainView,
    ChatBody,
    ChatUserProfile,
    ChatView,
    EmbeddingView,
    PromptView,
} from '@lemoncloud/ssocio-chatbots-api';

import {
    chatbotsKeys,
    formatDate,
    rootChatbotsKeys,
    useBrains,
    useCreateChildChats,
    useCreateRootChat,
    useEmbeddings,
    usePrompts,
} from '@eurekabox/chatbots';
import type { BulkCreateChildBotsBody } from '@eurekabox/chatbots';
import { Button } from '@eurekabox/lib/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@eurekabox/lib/components/ui/dialog';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';

export const TestChatSelectModal = ({
    open,
    onOpenChange,
    newChatName,
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    newChatName?: string;
}) => {
    const queryClient = useQueryClient();
    // const navigate = useNavigate();
    const { profile } = useWebCoreStore();

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

            const chatName = newChatName || `${profile$.name}_${formatDate(new Date().getTime(), 'YYMMDD_HHmm')}`;
            await createRootChat.mutateAsync(
                { name: chatName, profile$ },
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
                                toast({ title: '채팅 그룹이 성공적으로 생성되었습니다.' });
                                onOpenChange(false);
                                resetAllSelections();
                                console.log(newChat);
                                // TODO: open dialog
                                // navigate(`/ai/chat/${newChat.id}`);
                            },
                        });
                    },
                }
            );
        } catch (error) {
            console.error('Failed to create chat:', error);
            toast({
                title: '채팅 생성 실패',
                description: '채팅 생성 중 오류가 발생했습니다.',
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
            <DialogContent className="h-full max-w-[500px] p-0 !rounded-[22px] gap-0 overflow-hidden text-text">
                <DialogHeader className="sticky top-0 flex-row items-center justify-between pt-[14px] px-3 pb-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] bg-popup">
                    <DialogTitle className="text-base flex-1 text-center pl-6">테스트 모델 조합 선택</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <DialogClose className="!m-0">
                        <X />
                    </DialogClose>
                </DialogHeader>
                <div className="p-[18px] overflow-auto">
                    <div className="text-[18px] font-medium mb-7">
                        에이전트를 직접 조합한 후에
                        <br />
                        채팅 테스트를 진행해 보세요
                    </div>

                    {/* 임베딩 모델 */}
                    <div className="text-base font-medium mb-[2px]">임베딩 모델</div>
                    <div className="text-xs text-text-700">
                        컴퓨터가 이해할 수 있도록 데이터를 숫자로
                        <br />
                        이루어진 배열로 바꾸는 모델
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
                    <div className="text-base font-medium mb-[2px]">시스템 프롬프트</div>
                    <div className="text-xs text-text-700">AI 행동 방식, 말투, 역할과 같은 페르소나</div>
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
                    <div className="text-base font-medium mb-[2px]">채팅 모델</div>
                    <div className="text-xs text-text-700">인공지능 모델</div>
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
                    <div className="text-base font-medium mb-[2px]">사용자 프롬프트</div>
                    <div className="text-xs text-text-700">사용자의 질문과 관련 문서를 포함하여 AI에게 요청</div>
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
                    <div className="text-text-800 pb-[19px] pt-[18px] text-center">
                        {combinations.length === 0 ? (
                            <>
                                선택된 조합이 없습니다.
                                <br />위 4가지 유형에서 조합할 항목을 선택해주세요.
                            </>
                        ) : (
                            `선택된 조합 (${combinations.length})`
                        )}
                    </div>
                    {combinations.length > 0 && (
                        <div>
                            <div className="font-medium mb-[10px]">선택된 조합 ({combinations.length})</div>
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
                        <Button
                            variant="outline"
                            className="w-[182px] h-[46px] text-[18px]"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            취소
                        </Button>
                        <Button
                            className="w-[182px] h-[46px] text-[18px]"
                            disabled={combinations.length === 0 || isPending}
                            onClick={handleSubmit}
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                '생성'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
