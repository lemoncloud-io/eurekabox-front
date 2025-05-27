import { X } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import { cn } from '@eurekabox/lib/utils';

import { ConversationList } from './ConversationList';
import type { Conversation, HelpTab } from '../../types';

interface HelpPanelProps {
    activeTab: HelpTab;
    onTabChange: (tab: HelpTab) => void;
    onClose: () => void;
    conversations: Conversation[];
    onDeleteConversation: (id: string) => void;
    onTogglePinConversation: (id: string) => void;
}

const FAQ_ITEMS = [
    '자주 하는 질문 리스트 2줄 넘어갈 경우',
    '자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리 자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리 자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리 자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리',
];

export const HelpPanel = ({
    activeTab,
    onTabChange,
    onClose,
    conversations,
    onDeleteConversation,
    onTogglePinConversation,
}: HelpPanelProps) => {
    return (
        <div className="p-[6px] bg-[#F4F5F5] dark:bg-[#222325] border border-[#EAEAEC] dark:border-[#3A3C40] rounded-b-lg border-t-0">
            <div className="flex items-center sticky top-0">
                <Button variant="ghost" className="h-auto p-[2px] group" onClick={onClose}>
                    <X className="w-[18px] h-[18px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                </Button>
                <div className="flex ml-2 space-x-2">
                    <button
                        onClick={() => onTabChange('faq')}
                        className={cn(
                            'relative px-2 pb-[2px] text-xs transition-colors duration-200',
                            activeTab === 'faq' ? 'text-text-800' : 'text-[#BABCC0] dark:text-[#787878]'
                        )}
                    >
                        자주 하는 질문
                        {activeTab === 'faq' && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                        )}
                    </button>

                    <button
                        onClick={() => onTabChange('chat')}
                        className={cn(
                            'relative px-2 pb-[2px] text-xs transition-colors duration-200',
                            activeTab === 'chat' ? 'text-text-800' : 'text-[#BABCC0] dark:text-[#787878]'
                        )}
                    >
                        채팅 내역
                        {activeTab === 'chat' && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                        )}
                    </button>
                </div>
            </div>

            <div className="max-h-[228px] overflow-auto mt-[9px]">
                {activeTab === 'faq' && (
                    <ul className="flex flex-col space-y-[3px] px-[3px]">
                        {FAQ_ITEMS.map((item, index) => (
                            <li
                                key={index}
                                className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] line-clamp-2 max-h-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'chat' && (
                    <ConversationList
                        conversations={conversations}
                        onDeleteConversation={onDeleteConversation}
                        onTogglePinConversation={onTogglePinConversation}
                    />
                )}
            </div>
        </div>
    );
};
