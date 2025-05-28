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
