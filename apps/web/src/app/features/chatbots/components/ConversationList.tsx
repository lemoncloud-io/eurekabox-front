import { useTranslation } from 'react-i18next';

import { usePinnedConversations } from '../hooks';
import { ConversationItem } from './ConversationItem';
import type { MyChatView } from '../types';

interface ConversationListProps {
    conversations: MyChatView[];
    onDeleteConversation: (id: string) => void;
    onConversationClick: (conversation: MyChatView) => void;
    currentChatId?: string;
    isDisabled?: boolean;
}

export const ConversationList = ({
    conversations,
    onDeleteConversation,
    onConversationClick,
    currentChatId,
    isDisabled = false,
}: ConversationListProps) => {
    const { t } = useTranslation();
    const { pinnedConversations, recentConversations, togglePin, isPinned } = usePinnedConversations(conversations);

    return (
        <>
            {pinnedConversations.length > 0 && (
                <ul className="flex flex-col space-y-[3px] px-[3px]">
                    {pinnedConversations.map(conversation => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            onDelete={() => onDeleteConversation(conversation.id!)}
                            onTogglePin={() => togglePin(conversation.id!)}
                            onConversationClick={() => onConversationClick(conversation)}
                            isCurrentChat={currentChatId === conversation.id}
                            isDisabled={isDisabled}
                            isPinned={true}
                        />
                    ))}
                </ul>
            )}

            {recentConversations.length > 0 && (
                <>
                    {pinnedConversations.length > 0 && (
                        <div className="text-xs py-[9px]">{t('conversation.latest')}</div>
                    )}
                    <ul className="flex flex-col space-y-[3px] px-[3px]">
                        {recentConversations.map(conversation => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                onDelete={() => onDeleteConversation(conversation.id!)}
                                onTogglePin={() => togglePin(conversation.id!)}
                                onConversationClick={() => onConversationClick(conversation)}
                                isCurrentChat={currentChatId === conversation.id}
                                isDisabled={isDisabled}
                                isPinned={false}
                            />
                        ))}
                    </ul>
                </>
            )}
        </>
    );
};
