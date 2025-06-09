import type { LemonOAuthToken, RefreshTokenBody } from '@lemoncloud/lemon-web-core';

import { OAUTH_ENDPOINT, webCore } from '../core';
import { MAX_RETRIES, withRetry } from '../utils';

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

export const refreshAuthToken = async () => {
    return withRetry(
        async () => {
            const { current, signature, authId, originToken } = await webCore.getTokenSignature();
            if (!authId || !originToken || !signature || !originToken.identityToken) {
                throw new Error('Missing required token information');
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
        },
        MAX_RETRIES,
        'Token refresh'
    );
};
