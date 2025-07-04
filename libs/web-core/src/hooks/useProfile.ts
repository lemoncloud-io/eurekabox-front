import { useCallback } from 'react';

import { fetchProfile } from '../api';
import { useWebCoreStore } from '../stores';

export const useProfile = () => {
    const { setProfile } = useWebCoreStore();

    const loadProfile = useCallback(async () => {
        try {
            const profile = await fetchProfile();
            setProfile(profile);
            return profile;
        } catch (error) {
            console.error('❌ Profile fetch failed:', error);
            throw error;
        }
    }, [setProfile]);

    return { loadProfile };
};
