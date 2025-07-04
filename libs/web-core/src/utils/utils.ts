import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type { LemonOAuthToken } from '@lemoncloud/lemon-web-core';

import { classifyError, handleAuthError } from './error';


export interface ValidatedToken {
    identityToken: string;
    [key: string]: any;
}

export const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 4, context = 'API call'): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const classification = classifyError(error);
            // 인증 에러
            if (classification.shouldLogout) {
                handleAuthError(error, true, `${context} - ${classification.message}`);
            }
            // 재시도 불가능한 에러는 즉시 실패
            if (!classification.shouldRetry) {
                console.error(`${context} failed:`, classification.message);
                throw error;
            }
            // last try
            if (attempt === maxRetries) {
                console.error(`${context} failed after ${maxRetries + 1} attempts:`, classification.message);
                throw error;
            }
            // retry
            const delay = Math.pow(2, attempt) * 1000 * 60;
            console.warn(
                `${context} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
                classification.message
            );
            await createAsyncDelay(delay);
        }
    }

    throw lastError;
};

export const validateTokenResponse = (tokenData: any): LemonOAuthToken => {
    const token = tokenData?.Token;
    const tokenIdentityToken = token?.identityToken;
    const responseIdentityToken = tokenData?.identityToken;

    const identityToken = tokenIdentityToken || responseIdentityToken;
    if (!identityToken) {
        throw new Error('INVALID_TOKEN: identityToken is missing from refresh response');
    }

    return tokenData;
};
