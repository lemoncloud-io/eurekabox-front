import { useEffect, useRef } from 'react';

import type { RefreshTokenBody } from '@lemoncloud/lemon-web-core';

import { useProfile } from './useProfile';
import { OAUTH_ENDPOINT, webCore } from '../core';
import { useWebCoreStore } from '../stores';

const REFRESH_POLLING_TIME = 1000 * 60 * 1; // 1 minutes

const useTokenRefresh = () => {
    const refreshAuthToken = async () => {
        try {
            const { current, signature, authId, originToken } = await webCore.getTokenSignature();
            if (!authId || !originToken || !signature) {
                console.error('Missing required token information');
                window.location.href = '/auth/logout';
                return;
            }

            const body: RefreshTokenBody = { current, signature };

            const response = await webCore
                .signedRequest('POST', `${OAUTH_ENDPOINT}/oauth/${authId}/refresh`, {}, body)
                .catch(e => {
                    console.error(e);
                    window.location.href = '/auth/logout';
                });

            const refreshToken = {
                ...response.data.Token,
                identityToken: response.data.identityToken || originToken.identityToken || '',
                identityPoolId: response.data.identityPoolId || originToken.identityPoolId || '',
            };

            await webCore.buildCredentialsByToken(refreshToken);
        } catch (error) {
            console.error('Failed to refresh token:', error);
            window.location.href = '/auth/logout';
        }
    };

    return { refreshAuthToken };
};

export const useRefreshToken = () => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);
    const { fetchProfile } = useProfile();
    const { refreshAuthToken } = useTokenRefresh();

    const initializationRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        let intervalId: number;

        const initialize = async () => {
            if (!initializationRef.current) {
                await fetchProfile();
                initializationRef.current = true;
            }
        };

        const startTokenRefresh = () => {
            refreshAuthToken();
            intervalId = setInterval(refreshAuthToken, REFRESH_POLLING_TIME);
        };

        initialize();
        startTokenRefresh();

        return () => clearInterval(intervalId);
    }, [isAuthenticated]);
};
