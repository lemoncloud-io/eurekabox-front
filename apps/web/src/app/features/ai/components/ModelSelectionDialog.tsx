import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { HelpCircle } from 'lucide-react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type { BrainView, ChatBody, EmbeddingView, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import { chatbotsKeys, useBrains, useCreateChildChats, useEmbeddings, usePrompts } from '@eurekabox/chatbots';
import type { BulkCreateChildBotsBody } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Badge } from '@eurekabox/ui-kit/components/ui/badge';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@eurekabox/ui-kit/components/ui/card';
import { Checkbox } from '@eurekabox/ui-kit/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@eurekabox/ui-kit/components/ui/popover';




interface ModelSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    forceOpen?: boolean;
}

export const ModelSelectionDialog: React.FC<ModelSelectionDialogProps> = ({ open, onClose, forceOpen }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: embeddingsData } = useEmbeddings({});
    const { data: brainsData } = useBrains({});
    const { data: systemPromptsData } = usePrompts({ stereo: 'system' });
    const { data: userPromptsData } = usePrompts({ stereo: 'user' });

    const createChildChats = useCreateChildChats();

    const [selectedEmbeddings, setSelectedEmbeddings] = useState<EmbeddingView[]>([]);
    const [selectedChatModels, setSelectedChatModels] = useState<BrainView[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<PromptView[]>([]);
    const [selectedUserPrompts, setSelectedUserPrompts] = useState<PromptView[]>([]);

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
                    toast({ title: '채팅 그룹이 성공적으로 생성되었습니다.' });
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
        <Dialog
            open={forceOpen || open}
            onOpenChange={isOpen => {
                if (!forceOpen && !isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent showCloseButton={false} className="max-w-[600px] pt-0 flex flex-col">
                <DialogHeader>
                    <DialogTitle>모델 조합 선택</DialogTitle>
                </DialogHeader>
                <div className="p-6 overflow-auto grid gap-4 flex-1">
                    <Card className="border border-border p-0">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">임베딩 모델</CardTitle>
                                <Popover>
                                    <PopoverTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-3">
                                        <p className="text-sm">
                                            텍스트를 벡터로 변환하여 의미를 수치화하는 모델입니다. 문서 검색 및 유사도
                                            분석에 사용됩니다.
                                        </p>
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

                    <Card className="border border-border p-0">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">채팅 모델</CardTitle>
                                <Popover>
                                    <PopoverTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-3">
                                        <p className="text-sm">
                                            사용자의 질문에 답변을 생성하는 대화형 AI 모델입니다. GPT와 같은 언어 모델을
                                            포함합니다.
                                        </p>
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

                    <Card className="border border-border p-0">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">시스템 프롬프트</CardTitle>
                                <Popover>
                                    <PopoverTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-3">
                                        <p className="text-sm">
                                            AI의 동작 방식과 응답 스타일을 정의하는 프롬프트입니다.
                                        </p>
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
                                    <label htmlFor={`prompt-${prompt.id}`}>{prompt.name}</label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border border-border p-0">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">유저 프롬프트</CardTitle>
                                <Popover>
                                    <PopoverTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-3">
                                        <p className="text-sm">
                                            사용자의 질문과 관련 문서를 포함하여 AI에 요청하는 프롬프트입니다. 질문의
                                            문맥을 강화하고 정확한 답변을 유도합니다.
                                        </p>
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
                                    <label htmlFor={`userprompt_-${prompt.id}`}>{prompt.name}</label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="p-6 pb-0 mt-auto">
                    <Card className="border border-border p-0">
                        <CardHeader className="pb-2 mb-2">
                            <CardTitle className="text-sm font-medium">선택된 조합 ({combinations.length})</CardTitle>
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
                            취소
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!combinations || combinations.length === 0 || createChildChats.isPending}
                            className="flex-1"
                        >
                            {createChildChats.isPending ? (
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
