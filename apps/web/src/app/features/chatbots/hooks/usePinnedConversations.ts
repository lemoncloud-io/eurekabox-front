import { useCallback } from 'react';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { usePinnedConversationsStore } from '../stores';
import type { MyChatView } from '../types';

export const usePinnedConversations = (conversations: MyChatView[]) => {
    const { pinnedIds, togglePin, isPinned } = usePinnedConversationsStore();

    const processedConversations = useCallback(() => {
        const pinned = conversations.filter(chat => isPinned(chat.id!));
        const recent = conversations.filter(chat => !isPinned(chat.id!));

        // Sort by updatedAt descending
        const sortByDate = (a: ChatView, b: ChatView) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        return {
            pinnedConversations: pinned.sort(sortByDate),
            recentConversations: recent.sort(sortByDate),
        };
    }, [conversations, isPinned]);

    const handleTogglePin = useCallback(
        (id: string) => {
            togglePin(id);
        },
        [togglePin]
    );

    return {
        ...processedConversations(),
        togglePin: handleTogglePin,
        isPinned,
    };
};
