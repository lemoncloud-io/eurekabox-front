import { OAUTH_ENDPOINT, webCore } from '../core';
import type { UserProfile } from '../stores';
import { useWebCoreStore } from '../stores';

/**
 * Hook for managing user profile operations
 * - Handles profile data fetching
 * - Updates profile state in the store
 * @returns {Object} Object containing profile management functions
 */
export const useProfile = () => {
    const setProfile = useWebCoreStore(state => state.setProfile);

    /**
     * Fetches user profile from the OAuth endpoint
     * - Makes authenticated request to profile endpoint
     * - Updates store with retrieved profile data
     * - Handles fetch errors gracefully
     */
    const fetchProfile = async () => {
        try {
            const { data } = await webCore
                .buildSignedRequest({
                    method: 'GET',
                    baseURL: `${OAUTH_ENDPOINT}/users/0/profile`,
                })
                .execute<UserProfile>();
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    return { fetchProfile };
};
