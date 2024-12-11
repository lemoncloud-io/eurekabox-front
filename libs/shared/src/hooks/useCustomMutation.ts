import { UseMutationOptions, useMutation } from '@tanstack/react-query';

/**
 * useMutation을 래핑한 커스텀 훅으로, 타입 안전성과 일관된 에러 처리를 제공합니다.
 *
 * @template TData - API 응답 데이터 타입
 * @template TError - API 에러 타입
 * @template TVariables - mutation 함수에 전달될 변수 타입
 *
 * @param mutationFn - API 호출 함수
 * @param config - mutation 설정 (onSuccess, onError 등)
 */
export interface MutationConfig<TData, TError, TVariables>
    extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {}

export const useCustomMutation = <TData, TError, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    config?: MutationConfig<TData, TError, TVariables>
) => {
    return useMutation({
        mutationFn,
        ...config,
    });
};
