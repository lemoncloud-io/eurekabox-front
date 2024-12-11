import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { contentsKeys } from '@lemonote/contents';

export const useContentCache = () => {
    const queryClient = useQueryClient();

    const prependContentToInfiniteCache = useCallback(
        (content: ContentView) => {
            queryClient.setQueryData(contentsKeys.list({ limit: 10, page: 0 }), (oldData: any) => {
                if (!oldData) {
                    return {
                        pages: [
                            {
                                list: [content],
                                page: 0,
                                total: 1,
                            },
                        ],
                        pageParams: [0],
                    };
                }

                const newPages = [...oldData.pages];
                newPages[0] = {
                    ...newPages[0],
                    list: [content, ...newPages[0].list],
                    total: newPages[0].total + 1,
                };

                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        },
        [queryClient]
    );

    const removeContentFromInfiniteCache = useCallback(
        (contentId: string) => {
            queryClient.setQueryData(contentsKeys.list({ limit: 10, page: 0 }), (oldData: any) => {
                if (!oldData) return oldData;

                const newPages = oldData.pages.map(page => ({
                    ...page,
                    list: page.list.filter(item => item.id !== contentId),
                    total: page.total - 1,
                }));
                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        },
        [queryClient]
    );

    return {
        prependContentToInfiniteCache,
        removeContentFromInfiniteCache,
    };
};
