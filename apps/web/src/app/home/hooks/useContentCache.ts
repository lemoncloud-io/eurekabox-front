import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { contentsKeys } from '@eurekabox/contents';

export const useContentCache = () => {
    const queryClient = useQueryClient();

    const prependContentToCache = useCallback(
        (content: ContentView) => {
            queryClient.setQueryData(contentsKeys.list({ limit: -1, activity: 1 }), (oldData: any) => {
                console.log(content, oldData);
                if (!oldData) {
                    return { total: 1, data: [content] };
                }

                return {
                    ...oldData,
                    data: [content, ...oldData.data],
                    list: [content, ...oldData.list],
                    total: oldData.total + 1,
                };
            });
        },
        [queryClient]
    );

    const removeContentFromCache = useCallback(
        (contentId: string) => {
            queryClient.setQueryData(contentsKeys.list({ limit: -1, activity: 1 }), (oldData: any) => {
                console.log(contentId, oldData);
                if (!oldData) {
                    return oldData;
                }

                return {
                    ...oldData,
                    data: oldData.data.filter(origin => origin.id !== contentId),
                    list: oldData.list.filter(origin => origin.id !== contentId),
                    total: oldData.total - 1,
                };
            });
        },
        [queryClient]
    );

    return {
        prependContentToCache,
        removeContentFromCache,
    };
};
