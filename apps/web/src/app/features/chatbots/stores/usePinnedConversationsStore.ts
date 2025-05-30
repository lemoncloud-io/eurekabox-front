import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

interface PinnedConversationsState {
    pinnedIds: Set<string>;
    togglePin: (id: string) => void;
    isPinned: (id: string) => boolean;
    addPin: (id: string) => void;
    removePin: (id: string) => void;
    clearPinned: () => void;
}

export const usePinnedConversationsStore = create<PinnedConversationsState>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                pinnedIds: new Set<string>(),

                togglePin: (id: string) => {
                    set(state => {
                        const newPinnedIds = new Set(state.pinnedIds);

                        if (newPinnedIds.has(id)) {
                            newPinnedIds.delete(id);
                        } else {
                            newPinnedIds.add(id);
                        }

                        return { pinnedIds: newPinnedIds };
                    });
                },

                addPin: (id: string) => {
                    set(state => {
                        const newPinnedIds = new Set(state.pinnedIds);
                        newPinnedIds.add(id);
                        return { pinnedIds: newPinnedIds };
                    });
                },

                removePin: (id: string) => {
                    set(state => {
                        const newPinnedIds = new Set(state.pinnedIds);
                        newPinnedIds.delete(id);
                        return { pinnedIds: newPinnedIds };
                    });
                },

                isPinned: (id: string) => {
                    return get().pinnedIds.has(id);
                },

                clearPinned: () => {
                    set({ pinnedIds: new Set() });
                },
            }),
            {
                name: 'pinned-conversations',
                version: 1,
                storage: {
                    getItem: name => {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        const parsed = JSON.parse(str);
                        return {
                            ...parsed,
                            state: {
                                ...parsed.state,
                                pinnedIds: new Set(parsed.state.pinnedIds || []),
                            },
                        };
                    },
                    setItem: (name, value) => {
                        const toStore = {
                            ...value,
                            state: {
                                ...value.state,
                                pinnedIds: Array.from(value.state.pinnedIds),
                            },
                        };
                        localStorage.setItem(name, JSON.stringify(toStore));
                    },
                    removeItem: name => localStorage.removeItem(name),
                },
            }
        )
    )
);
