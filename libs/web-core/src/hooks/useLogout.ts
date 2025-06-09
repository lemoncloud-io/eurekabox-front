import { useMutation } from '@tanstack/react-query';

import { useWebCoreStore } from '../stores';

/**
 * Type definition for success event handler
 * Called after successful logout operation
 */
type HandleSuccessEventFunc = (value?: never) => void;

/**
 * Type definition for error event handler
 * Called when logout operation fails
 */
type HandleErrorEventFunc = (error?: Error) => void;

/**
 * Hook for managing user logout operations
 * - Provides mutation for handling logout process
 * - Supports success and error event handlers
 * - Integrates with React Query for state management
 *
 * @param handleSuccessEvent - Optional callback for successful logout
 * @param handleErrorEvent - Optional callback for logout failures
 * @returns Mutation object for managing logout state and execution
 */
export const useLogout = (handleSuccessEvent?: HandleSuccessEventFunc, handleErrorEvent?: HandleErrorEventFunc) => {
    const logout = useWebCoreStore(state => state.logout);

    return useMutation({
        mutationKey: ['LOGOUT_USER'],
        mutationFn: async () => await logout(),
        onSuccess(data) {
            handleSuccessEvent && handleSuccessEvent(data);
        },
        onError(error) {
            handleErrorEvent && handleErrorEvent(error);
        },
    });
};
