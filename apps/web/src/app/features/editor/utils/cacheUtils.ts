import type { useQueryClient } from '@tanstack/react-query';

import { contentsKeys } from '@eurekabox/contents';

export interface ContentListItem {
    id: string;
    title: string;
    [key: string]: any;
}

export interface ContentListData {
    total: number;
    data: ContentListItem[];
    list: ContentListItem[];
}

export const updateContentInCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    contentId: string,
    updates: Partial<ContentListItem>
) => {
    const queryKey = contentsKeys.list({ limit: -1, activity: 1 });

    queryClient.setQueryData(queryKey, (oldData: ContentListData | undefined) => {
        if (!oldData) {
            return oldData;
        }

        const updateItems = (items: ContentListItem[]) =>
            items.map(item => (item.id === contentId ? { ...item, ...updates } : item));

        return {
            ...oldData,
            data: updateItems(oldData.data),
            list: updateItems(oldData.list),
        };
    });
};
