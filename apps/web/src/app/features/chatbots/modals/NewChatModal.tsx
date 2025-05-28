import { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { useStartMyChat } from '@eurekabox/chatbots';
import { Button } from '@eurekabox/lib/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@eurekabox/lib/components/ui/dialog';
import { Input } from '@eurekabox/lib/components/ui/input';
import { Label } from '@eurekabox/lib/components/ui/label';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';


export const CHAT_MODELS = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: '가장 강력한 AI 모델로 복잡한 작업에 최적화',
        pricing: { input: 0.15, cachedInput: 0.075, output: 0.6 },
        isActive: false,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: '빠르고 효율적인 일상 업무용 AI 모델',
        pricing: { input: 0.075, cachedInput: 0.0375, output: 0.3 },
        isActive: true,
    },
];

interface NewChatModalProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onChatCreated: (chat: ChatView) => void; // 새로 추가
}

export const NewChatModal = ({ open, onOpenChange, onChatCreated }: NewChatModalProps) => {
    const { profile } = useWebCoreStore();
    const startMyChat = useStartMyChat();

    const [selectedModelId, setSelectedModelId] = useState(CHAT_MODELS.find(m => m.isActive)?.id || CHAT_MODELS[0].id);
    const [chatName, setChatName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (open) {
            setChatName('');
            setSelectedModelId(CHAT_MODELS.find(m => m.isActive)?.id || CHAT_MODELS[0].id);
        }
    }, [open]);

    const handleCreateChat = async () => {
        if (!chatName.trim()) {
            toast({ title: '채팅명을 입력해주세요.' });
            return;
        }

        try {
            setIsCreating(true);

            const profile$: ChatUserProfile = {
                ...(profile?.sid && { sid: profile.sid }),
                ...(profile?.uid && { uid: profile.uid }),
                ...(profile?.$user?.gender && { gender: profile?.$user?.gender }),
                ...(profile?.$user?.name && { name: profile?.$user?.name }),
            };

            const newChat = await startMyChat.mutateAsync({
                name: chatName.trim(),
                profile$,
            });

            toast({ title: '새 채팅이 생성되었습니다.' });
            onChatCreated(newChat);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create chat:', error);
            toast({ title: '채팅 생성에 실패했습니다.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCreateChat();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] p-0 !rounded-[22px] gap-0 overflow-hidden text-text">
                <DialogHeader className="sticky top-0 flex-row items-center justify-between pt-[14px] px-3 pb-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] bg-popup">
                    <DialogTitle className="text-base flex-1 text-center pl-6">새 채팅 만들기</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <DialogClose className="!m-0">
                        <X />
                    </DialogClose>
                </DialogHeader>

                <div className="p-[18px] space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">채팅 모델</Label>
                        <div className="space-y-[10px] max-h-[300px] overflow-auto">
                            {CHAT_MODELS.map(model => (
                                <div
                                    key={model.id}
                                    className={`dark:bg-[#02060E] border cursor-pointer transition-all duration-200 ${
                                        selectedModelId === model.id
                                            ? 'border-[1.5px] border-[#7932FF] bg-[#7932FF]/5 dark:border-[#7932FF]'
                                            : 'border-[#babcc0] dark:border-[#787878] hover:border-[#7932FF]/50 hover:dark:border-[#7932FF]/50'
                                    } rounded-lg py-[10px] px-[14px]`}
                                    onClick={() => setSelectedModelId(model.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-text-800 flex items-center gap-2">
                                                <span className="text-base font-medium">{model.name}</span>
                                                {model.isActive && (
                                                    <span className="text-xs bg-[#7932FF] text-white px-2 py-1 rounded-full">
                                                        추천
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-text-600 mt-1">{model.description}</div>
                                            <div className="text-xs text-dim mt-2">
                                                input ${model.pricing.input} / Cached input ${model.pricing.cachedInput}{' '}
                                                / Output ${model.pricing.output}
                                            </div>
                                        </div>
                                        {selectedModelId === model.id && (
                                            <div className="w-4 h-4 bg-[#7932FF] rounded-full flex items-center justify-center ml-3 mt-1">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="chatName" className="text-sm font-medium">
                            채팅명
                        </Label>
                        <Input
                            id="chatName"
                            placeholder="채팅명을 입력하세요"
                            value={chatName}
                            onChange={e => setChatName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isCreating}
                            className="h-[42px]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-7 pb-6 mt-auto bg-popup border-t border-[#EAEAEC] dark:border-[#3A3C40]">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-[182px] h-[46px] text-[18px]" disabled={isCreating}>
                            취소
                        </Button>
                    </DialogClose>
                    <Button
                        className="w-[182px] h-[46px] text-[18px]"
                        onClick={handleCreateChat}
                        disabled={!chatName.trim() || isCreating}
                    >
                        {isCreating ? '생성 중...' : '생성'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
