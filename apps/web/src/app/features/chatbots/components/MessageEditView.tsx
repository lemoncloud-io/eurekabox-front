import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { Button } from '@eurekabox/lib/components/ui/button';


interface MessageEditViewProps {
    message: ChatView;
    onSave: (messageId: string, newContent: string) => void;
    onCancel: () => void;
}

export const MessageEditView = ({ message, onSave, onCancel }: MessageEditViewProps) => {
    const [editedContent, setEditedContent] = useState(message.content);

    const handleSave = () => {
        if (editedContent.trim() !== message.content) {
            onSave(message.id, editedContent.trim());
        }
        onCancel(); // 편집 모드 종료
    };

    return (
        <div className="w-[484px] min-h-[350px] max-h-[90vh] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
            <div className="py-[10px] px-3 flex items-center justify-between sticky top-0">
                <div className="flex items-center gap-[6px]">
                    <Button variant="ghost" className="h-auto p-[2px] group" onClick={onCancel}>
                        <ChevronLeft className="w-[18px] h-[18px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                    </Button>
                    <div className="font-medium truncate">채팅 질문 요약명으로 노출</div>
                </div>
                <Button size="sm" className="dark:bg-[#53009A]" onClick={handleSave}>
                    수정 완료
                </Button>
            </div>
            <div className="py-[18px] px-[30px] bg-[#F4F5F5] dark:bg-[#2E2E2E] h-full">
                <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="w-full h-full min-h-[200px] bg-transparent border-none outline-none resize-none text-text"
                    placeholder="메시지를 수정하세요..."
                />
            </div>
        </div>
    );
};
