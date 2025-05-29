/**
 * React Query에서 사용할 쿼리 키를 생성하는 함수
 * 리소스별로 일관된 쿼리 키 구조를 제공합니다.
 *
 * @param resource - 리소스 이름 (예: 'projects', 'workspaces')
 * @param rest - Additional 리소스 이름 (예: 'subProjects', 'tasks')
 * @returns 쿼리 키 생성 메서드들을 포함한 객체
 *
 * @example
 * const projectKeys = createQueryKeys('projects', 'subProjects');
 * projectKeys.all; // ['projects', 'subProjects']
 * projectKeys.lists(); // ['projects', 'subProjects', 'list']
 * projectKeys.list({ page: 1 }); // ['projects', 'subProjects', 'list', { filters: { page: 1 }}]
 * projectKeys.detail('123'); // ['projects', 'subProjects', 'detail', '123']
 */
export const createQueryKeys = (resource: string, ...rest: string[]) => {
    const all = [resource, ...rest] as const;

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
