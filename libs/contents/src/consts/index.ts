export const contentsKeys = {
    all: ['contents'] as const,
    lists: () => [...contentsKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...contentsKeys.lists(), { filters }] as const,
    details: () => [...contentsKeys.all, 'detail'] as const,
    detail: (id: string) => [...contentsKeys.details(), id] as const,
    invalidateList: () => ({
        queryKey: ['contents', 'list'],
        exact: false,
    }),
} as const;

export const elementsKeys = {
    all: ['elements'] as const,
    lists: () => [...elementsKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...elementsKeys.lists(), { filters }] as const,
    details: () => [...elementsKeys.all, 'detail'] as const,
    detail: (id: string) => [...elementsKeys.details(), id] as const,
    invalidateList: () => ({
        queryKey: ['elements', 'list'],
        exact: false,
    }),
} as const;
