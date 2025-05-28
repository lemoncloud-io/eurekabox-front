import { useEffect, useRef } from 'react';


import { useProfile } from './useProfile';
import { refreshAuthToken } from '../api';
import { useWebCoreStore } from '../stores';

const REFRESH_POLLING_TIME = 1000 * 60 * 1; // 1 minutes

export const useRefreshToken = () => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);
    const { fetchProfile } = useProfile();

    const initializationRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        let intervalId: number;

        const initialize = async () => {
            if (!initializationRef.current) {
                try {
                    await fetchProfile();
                    initializationRef.current = true;
                } catch (error) {
                    console.error('Initialization failed:', error);
                    window.location.href = '/auth/logout';
                }
            }
        };

        const startTokenRefresh = () => {
            intervalId = setInterval(refreshAuthToken, REFRESH_POLLING_TIME);
        };

        initialize();
        startTokenRefresh();

        return () => clearInterval(intervalId);
    }, [isAuthenticated]);
};
