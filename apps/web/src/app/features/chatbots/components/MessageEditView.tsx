import { useEffect, useState } from 'react';

import { ChevronLeft } from 'lucide-react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Button } from '@eurekabox/lib/components/ui/button';

interface MessageEditViewProps {
    message: ChatView;
    onSave: (messageId: string, newContent: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const MessageEditView = ({ message, onSave, onCancel, isLoading = false }: MessageEditViewProps) => {
    const [editedContent, setEditedContent] = useState(message.content || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedContent(message.content || '');
    }, [message.content]);

    const handleSave = async () => {
        const trimmedContent = editedContent.trim();
        if (!trimmedContent) {
            return;
        }

        if (trimmedContent === message.content) {
            onCancel();
            return;
        }

        try {
            setIsSaving(true);
            await onSave(message.id!, trimmedContent);
            onCancel();
        } catch (error) {
            console.error('Failed to save message:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    const hasChanges = editedContent.trim() !== message.content;
    const canSave = editedContent.trim() && hasChanges && !isSaving && !isLoading;

    return (
        <div className="w-[484px] min-h-[350px] max-h-[90vh] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
            <div className="py-[10px] px-3 flex items-center justify-between sticky top-0 bg-chatbot-card border-b border-[#EAEAEC] dark:border-[#3A3C40]">
                <div className="flex items-center gap-[6px]">
                    <Button variant="ghost" className="h-auto p-[2px] group" onClick={onCancel} disabled={isSaving}>
                        <ChevronLeft className="w-[18px] h-[18px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                    </Button>
                    <div className="font-medium truncate">메시지 편집</div>
                </div>
                <Button
                    size="sm"
                    className="dark:bg-[#7932FF] bg-[#7932FF] hover:bg-[#6028E0]"
                    onClick={handleSave}
                    disabled={!canSave}
                >
                    {isSaving ? '저장 중...' : '수정 완료'}
                </Button>
            </div>

            <div className="py-[18px] px-[30px] bg-[#F4F5F5] dark:bg-[#2E2E2E] flex-1 flex flex-col">
                <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full flex-1 min-h-[200px] bg-transparent border-none outline-none resize-none text-text placeholder:text-text-500"
                    placeholder="메시지를 수정하세요..."
                    disabled={isSaving || isLoading}
                    autoFocus
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#374151]">
                    <div className="text-xs text-text-500">
                        {hasChanges ? '변경사항이 있습니다' : '변경사항이 없습니다'}
                    </div>
                    <div className="text-xs text-text-500">Ctrl+Enter로 저장, Esc로 취소</div>
                </div>
            </div>
        </div>
    );
};
