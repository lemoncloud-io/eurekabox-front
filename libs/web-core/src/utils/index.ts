import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

import { classifyError } from './error';

export const MAX_RETRIES = 5;

const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다';

export const extractErrorMessage = (error: any): string => {
    if (!error) {
        return DEFAULT_ERROR_MESSAGE;
    }

    if (error.message) {
        return error.message;
    }

    if (error.status || error.statusText) {
        return `${error.status || ''} ${error.statusText || ''}`.trim();
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error.toString && error.toString() !== '[object Object]') {
        return error.toString();
    }

    if (error.response?.data) {
        if (error.response.data.error) {
            return error.response.data.error;
        }
        if (error.response.data.message) {
            return error.response.data.message;
        }
    }

    return DEFAULT_ERROR_MESSAGE;
};

export const handleAuthError = (error: any, shouldLogout: boolean, message?: string): never => {
    console.error(message || 'Authentication error:', error);
    const errorMessage = extractErrorMessage(error);

    if (shouldLogout) {
        alert(`인증 오류: ${errorMessage}`);
        window.location.href = '/auth/logout';
    } else {
        console.error(`요청 오류: ${errorMessage}`);
    }

    throw error;
};

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
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(
                `${context} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
                classification.message
            );
            await createAsyncDelay(delay);
        }
    }

    throw lastError;
};
