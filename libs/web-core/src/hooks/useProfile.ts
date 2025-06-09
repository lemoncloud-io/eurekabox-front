import { refreshAuthToken } from '../api';
import { OAUTH_ENDPOINT, webCore } from '../core';
import type { UserProfile } from '../stores';
import { useWebCoreStore } from '../stores';
import { MAX_RETRIES, withRetry } from '../utils';

/**
 * Hook for managing user profile operations
 * - Handles profile data fetching
 * - Updates profile state in the store
 * @returns {Object} Object containing profile management functions
 */
export const useProfile = () => {
    const setProfile = useWebCoreStore(state => state.setProfile);

    const fetchProfile = async () => {
        try {
            return await withRetry(
                async () => {
                    const { data } = await webCore
                        .buildSignedRequest({
                            method: 'GET',
                            baseURL: `${OAUTH_ENDPOINT}/users/0/profile`,
                        })
                        .execute<UserProfile>();
                    setProfile(data);
                    return data;
                },
                MAX_RETRIES,
                'Profile fetch'
            );
        } catch (error: any) {
            // Check if it's a 403 error
            const is403 =
                error?.status === 403 ||
                error?.response?.status === 403 ||
                (error?.message && error.message.includes('403'));

            if (is403) {
                console.log('Profile fetch got 403, attempting token refresh...');
                try {
                    await refreshAuthToken();
                    // Retry profile fetch once after successful token refresh
                    return await withRetry(
                        async () => {
                            const { data } = await webCore
                                .buildSignedRequest({
                                    method: 'GET',
                                    baseURL: `${OAUTH_ENDPOINT}/users/0/profile`,
                                })
                                .execute<UserProfile>();
                            setProfile(data);
                        },
                        1,
                        'Profile fetch after token refresh'
                    );
                } catch (refreshError) {
                    // If refreshAuthToken fails with 403, it will handle logout automatically
                    // For other refresh errors, re-throw the original profile fetch error
                    console.error('Token refresh failed during profile fetch:', refreshError);
                    throw error;
                }
            }
            // For non-403 errors, just re-throw
            throw error;
        }
    };

    return { fetchProfile };
};
