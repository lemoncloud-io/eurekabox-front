import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { useStartMyChat } from '@eurekabox/chatbots';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';
import { Input } from '@eurekabox/lib/components/ui/input';
import { Label } from '@eurekabox/lib/components/ui/label';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useWebCoreStore } from '@eurekabox/web-core';

export const CHAT_MODELS = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        descriptionKey: 'chatModels.gpt4o.description',
        pricing: { input: 0.15, cachedInput: 0.075, output: 0.6 },
        isActive: false,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        descriptionKey: 'chatModels.gpt4oMini.description',
        pricing: { input: 0.075, cachedInput: 0.0375, output: 0.3 },
        isActive: true,
    },
];

interface NewChatModalProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onChatCreated: (chat: ChatView) => void;
}

export const NewChatModal = ({ open, onOpenChange, onChatCreated }: NewChatModalProps) => {
    const { t } = useTranslation();
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
            toast({ title: t('newChatModal.enter_chat_name') });
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

            toast({ title: t('newChatModal.chat_created_success') });
            onChatCreated(newChat);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create chat:', error);
            toast({ title: t('newChatModal.chat_created_failed') });
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
            <DialogContent className="p-0">
                <DialogHeader>
                    <DialogTitle>{t('newChatModal.create_new_chat')}</DialogTitle>
                </DialogHeader>
                <div className="px-[18px] space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('newChatModal.chat_model')}</Label>
                        <div className="space-y-[10px] max-h-[300px] overflow-auto">
                            {CHAT_MODELS.map(model => (
                                <div
                                    key={model.id}
                                    className={`dark:bg-[#02060E] border-[1.5px] cursor-pointer transition-all duration-200 ${
                                        selectedModelId === model.id
                                            ? 'border-[#7932FF] bg-[#7932FF]/5 dark:border-[#7932FF]'
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
                                                        {t('newChatModal.recommended')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-text-600 mt-1">{t(model.descriptionKey)}</div>
                                            <div className="text-xs text-dim mt-2">
                                                {t('newChatModal.pricing', {
                                                    input: model.pricing.input,
                                                    cachedInput: model.pricing.cachedInput,
                                                    output: model.pricing.output,
                                                })}
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
                            {t('newChatModal.chat_name')}
                        </Label>
                        <Input
                            id="chatName"
                            placeholder={t('newChatModal.enter_chat_name_placeholder')}
                            value={chatName}
                            onChange={e => setChatName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isCreating}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-7 pb-6 mt-auto bg-popup">
                    <DialogClose asChild>
                        <Button variant="outline" size="lg" disabled={isCreating}>
                            {t('common.cancel')}
                        </Button>
                    </DialogClose>
                    <Button size="lg" onClick={handleCreateChat} disabled={!chatName.trim() || isCreating}>
                        {isCreating ? t('newChatModal.creating') : t('common.create')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
