import type { LemonOAuthToken, RefreshTokenBody } from '@lemoncloud/lemon-web-core';
import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

import { OAUTH_ENDPOINT, webCore } from '../core';
import { handleAuthError } from '../utils';

/**
 * Creates authentication credentials using OAuth provider
 * - Exchanges authorization code for access token
 * - Builds credentials using the obtained token
 *
 * @param provider - OAuth provider name (default: 'google')
 * @param code - Authorization code from OAuth flow
 * @returns Promise resolving to authentication credentials
 */
export const createCredentialsByProvider = async (provider = 'google', code: string) => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${OAUTH_ENDPOINT}/oauth/${provider}/token`,
        })
        .setBody({ code })
        .execute<{ Token: LemonOAuthToken }>();

    return await webCore.buildCredentialsByToken(data.Token);
};

export const refreshAuthToken = async (retryCount = 0, maxRetries = 4) => {
    try {
        const { current, signature, authId, originToken } = await webCore.getTokenSignature();
        if (!authId || !originToken || !signature || !originToken.identityToken) {
            handleAuthError(new Error('Missing required token information'), false);
        }

        const body: RefreshTokenBody = { current, signature };

        const response = await webCore
            .buildSignedRequest({
                method: 'POST',
                baseURL: `${OAUTH_ENDPOINT}/oauth/${authId}/refresh`,
            })
            .setBody({ ...body })
            .execute<LemonOAuthToken>();

        const refreshToken = {
            ...response.data.Token,
            identityToken: response.data.identityToken || originToken.identityToken || '',
            identityPoolId: response.data.identityPoolId || originToken.identityPoolId || '',
        };

        await webCore.buildCredentialsByToken(refreshToken);
    } catch (error) {
        const shouldLogout = isAuthenticationError(error);
        if (shouldLogout) {
            handleAuthError(error, true, 'Authentication failed - token expired');
        } else if (retryCount < maxRetries) {
            console.warn(`Token refresh failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            // 1초, 2초, 4초 대기
            const delay = Math.pow(2, retryCount) * 1000;
            await createAsyncDelay(delay);

            return refreshAuthToken(retryCount + 1, maxRetries);
        } else {
            handleAuthError(error, false, 'Failed to refresh token after retries');
        }
    }
};

const isAuthenticationError = (error: any): boolean => {
    // NOTE: check 403 error code
    const status = error?.status || error?.response?.status || error?.statusCode;
    return status === 403;
};
