import { OAUTH_ENDPOINT, webCore } from '../core';
import type { UserProfile } from '../stores';
import { useWebCoreStore } from '../stores';

export const useProfile = () => {
    const setProfile = useWebCoreStore(state => state.setProfile);

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
