import { PaginationType, useCustomMutation } from '@lemonote/shared';
import { createAsyncDelay, Params } from '@lemoncloud/lemon-web-core';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { contentsKeys } from '../consts';
import { createContent, deleteContent, fetchContentById, fetchContents, updateContent } from '../api';
import { CreateContentDTO, UpdateContentDTO } from '../types';
import { toast } from '@lemonote/ui-kit/hooks/use-toast';

/**
 * 컨텐츠 목록을 불러오는 훅
 * 무한 스크롤을 지원하며, 검색과 필터링이 가능합니다.
 *
 * @example
 * ```tsx
 * const ContentList = () => {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage
 *   } = useInfiniteContents({
 *     limit: 10,
 *     name: searchTerm
 *   });
 *
 *   return (
 *     <div>
 *       {data?.pages.map(page =>
 *         page.data.map(content => <ContentItem key={content.id} content={content} />)
 *       )}
 *       {hasNextPage && (
 *         <button onClick={() => fetchNextPage()}>
 *           더 보기
 *         </button>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export const useInfiniteContents = (params?: Params) => {
    return useInfiniteQuery({
        queryKey: contentsKeys.list(params ?? {}),
        queryFn: ({ pageParam = 0 }) => fetchContents({ ...params, page: pageParam }),
        getNextPageParam: lastPage => {
            const { page, limit, total } = lastPage;
            const maxPages = Math.ceil(total / limit);
            return page + 1 < maxPages ? page + 1 : undefined;
        },
        initialData: undefined,
        initialPageParam: 0,
    } as never);
};

export const useContents = (params: Params) =>
    useQuery<PaginationType<ContentView[]>>({
        queryKey: contentsKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchContents(params);
            return { ...result, data: result.list || [] } as PaginationType<ContentView[]>;
        },
        refetchOnWindowFocus: false,
    });

export const useContent = (contentId: string) =>
    useQuery<ContentView>({
        queryKey: contentsKeys.detail(contentId),
        queryFn: () => fetchContentById(contentId),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!contentId,
    });

/**
 * 컨텐츠 생성 mutation 훅
 *
 * @example
 * ```tsx
 * const CreateContent = () => {
 *   const queryClient = useQueryClient();
 *   const createContent = useCreateContent();
 *
 *   const handleSubmit = async (data: CreateContentDTO) => {
 *     await createContent.mutateAsync(data, {
 *       onSuccess: (response) => {
 *         toast.success('컨텐츠가 생성되었습니다.');
 *         queryClient.invalidateQueries(contentsKeys.lists());
 *       },
 *       onError: (error) => {
 *         toast.error('컨텐츠 생성에 실패했습니다.');
 *       }
 *     });
 *   };
 * ```
 */
export const useCreateContent = () => {
    return useCustomMutation((data: CreateContentDTO) => createContent(data), {
        onError: error => {
            toast({ description: `${error.toString()}`, variant: 'destructive' });
        },
    });
};

/**
 * 컨텐츠 수정 mutation 훅
 *
 * @example
 * ```tsx
 * const EditContent = ({ contentId }: { contentId: string }) => {
 *   const updateContent = useUpdateContent();
 *
 *   const handleSubmit = async (data: UpdateContentDTO) => {
 *     await updateContent.mutateAsync(
 *       { contentId, ...data },
 *       {
 *         onSuccess: () => {
 *           toast.success('수정되었습니다.');
 *         },
 *         onError: (error) => {
 *           toast.error('수정에 실패했습니다.');
 *         }
 *       }
 *     );
 *   };
 * ```
 */
export const useUpdateContent = () => {
    const queryClient = useQueryClient();

    return useCustomMutation((data: UpdateContentDTO) => updateContent(data), {
        onSuccess: async (response, variables) => {
            queryClient.setQueryData(contentsKeys.detail(variables.contentId), response);
            await createAsyncDelay(500);
            await queryClient.invalidateQueries(contentsKeys.lists() as never);
        },
    });
};

export const useDeleteContent = () => {
    return useCustomMutation((id: string) => deleteContent(id), {
        onError: error => {
            toast({ description: `${error.toString()}`, variant: 'destructive' });
        },
    });
};
