import { useMemo } from 'react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
    conversations: ChatView[];
    onDeleteConversation: (id: string) => void;
    onTogglePinConversation: (id: string) => void;
    onConversationClick: (conversation: ChatView) => void;
    currentChatId?: string;
    isDisabled?: boolean;
}

export const ConversationList = ({
    conversations,
    onDeleteConversation,
    onTogglePinConversation,
    onConversationClick,
    currentChatId,
    isDisabled = false,
}: ConversationListProps) => {
    const { pinnedConversations, recentConversations } = useMemo(() => {
        const pinned = conversations.filter(conv => conv['isPinned']);
        const recent = conversations.filter(conv => !conv['isPinned']);

        // Sort by updatedAt descending
        const sortByDate = (a: ChatView, b: ChatView) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        return {
            pinnedConversations: pinned.sort(sortByDate),
            recentConversations: recent.sort(sortByDate),
        };
    }, [conversations]);

    return (
        <>
            {pinnedConversations.length > 0 && (
                <ul className="flex flex-col space-y-[3px] px-[3px]">
                    {pinnedConversations.map(conversation => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            onDelete={() => onDeleteConversation(conversation.id!)}
                            onTogglePin={() => onTogglePinConversation(conversation.id!)}
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
                    {pinnedConversations.length > 0 && <div className="text-xs py-[9px]">최근</div>}
                    <ul className="flex flex-col space-y-[3px] px-[3px]">
                        {recentConversations.map(conversation => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                onDelete={() => onDeleteConversation(conversation.id!)}
                                onTogglePin={() => onTogglePinConversation(conversation.id!)}
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
