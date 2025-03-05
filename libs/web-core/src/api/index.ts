import type { LemonOAuthToken } from '@lemoncloud/lemon-web-core';

import { OAUTH_ENDPOINT, webCore } from '../core';

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
