import type { QueryClient } from '@tanstack/react-query';

const REQUEST_DELAY = 5000;

/**
 * React Query에서 사용할 쿼리 키를 생성하는 함수
 * 리소스별로 일관된 쿼리 키 구조를 제공합니다.
 *
 * @param {string} resource - 리소스 이름 (예: 'projects', 'workspaces')
 * @returns {Object} 쿼리 키 생성 메서드들을 포함한 객체
 *
 * @example
 * const projectKeys = createQueryKeys('projects');
 * projectKeys.all; // ['projects']
 * projectKeys.lists(); // ['projects', 'list']
 * projectKeys.list({ page: 1 }); // ['projects', 'list', { filters: { page: 1 }}]
 * projectKeys.detail('123'); // ['projects', 'detail', '123']
 */
export const createQueryKeys = (resource: string) => {
    const all = [resource] as const;

    return {
        all,
        lists: () => [...all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...all, 'list', { filters }] as const,
        details: () => [...all, 'detail'] as const,
        detail: (id: string) => [...all, 'detail', id] as const,
        invalidateList: () => ({
            queryKey: [resource, 'list'],
            exact: false,
        }),
    };
};

type CacheUpdateOptions = {
    resource: string;
    queryClient: QueryClient;
    shouldInvalidate?: boolean;
    invalidateDelay?: number;
};

export const updateAllListCaches = async <T = any>(
    { resource, queryClient, shouldInvalidate = true, invalidateDelay = REQUEST_DELAY }: CacheUpdateOptions,
    updateFn: (oldData: T) => T
) => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.findAll({
        predicate: query => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && queryKey[0] === resource && queryKey[1] === 'list';
        },
    });

    const updatePromises = queries.map(query => {
        const currentData = query.state.data;
        if (!currentData) return Promise.resolve();

        return new Promise<void>((resolve, reject) => {
            try {
                queryClient.setQueryData(query.queryKey, updateFn);
                resolve();
            } catch (error) {
                console.error(`Failed to update cache for query ${JSON.stringify(query.queryKey)}:`, error);
                reject(error);
            }
        });
    });

    try {
        await Promise.allSettled(updatePromises);

        if (shouldInvalidate) {
            // 즉시 invalidate 하거나, 필요시에만 지연
            if (invalidateDelay > 0) {
                setTimeout(async () => {
                    await queryClient.invalidateQueries(createQueryKeys(resource).invalidateList());
                }, invalidateDelay as number);
            } else {
                await queryClient.invalidateQueries(createQueryKeys(resource).invalidateList());
            }
        }
    } catch (error) {
        console.error(`Cache update failed for resource ${resource}:`, error);
        // 실패 시 강제로 invalidate
        await queryClient.invalidateQueries(createQueryKeys(resource).invalidateList());
    }
};
