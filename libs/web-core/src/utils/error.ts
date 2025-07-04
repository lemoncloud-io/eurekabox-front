export enum ErrorType {
    AUTHENTICATION = 'authentication', // 403 - 로그아웃 필요
    NETWORK = 'network', // 네트워크 연결 문제 - 재시도
    SERVER = 'server', // 5xx - 재시도
    CLIENT = 'client', // 4xx (403 제외) - 즉시 실패
    UNKNOWN = 'unknown', // 기타
}

export interface ErrorClassification {
    type: ErrorType;
    shouldRetry: boolean;
    shouldLogout: boolean;
    message: string;
}

export const MAX_RETRIES = 2;

const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다';

export const classifyError = (error: any): ErrorClassification => {
    const status = error?.status || error?.response?.status || error?.statusCode;
    const message = error?.message || '';

    if (message.includes('INVALID_TOKEN') || message.includes('Token validation failed')) {
        return {
            type: ErrorType.AUTHENTICATION,
            shouldRetry: false,
            shouldLogout: true,
            message: '토큰이 유효하지 않습니다',
        };
    }

    if (status === 403) {
        return {
            type: ErrorType.AUTHENTICATION,
            shouldRetry: false,
            shouldLogout: true,
            message: '인증이 만료되었습니다',
        };
    }

    if (isNetworkError(error)) {
        return {
            type: ErrorType.NETWORK,
            shouldRetry: true,
            shouldLogout: false,
            message: '네트워크 연결을 확인해주세요',
        };
    }

    if (status >= 500 && status < 600) {
        return {
            type: ErrorType.SERVER,
            shouldRetry: true,
            shouldLogout: false,
            message: '서버 오류가 발생했습니다',
        };
    }

    if (status >= 400 && status < 500) {
        return {
            type: ErrorType.CLIENT,
            shouldRetry: false,
            shouldLogout: false,
            message: '요청에 문제가 있습니다',
        };
    }

    return {
        type: ErrorType.UNKNOWN,
        shouldRetry: true,
        shouldLogout: false,
        message: '알 수 없는 오류가 발생했습니다',
    };
};

const isNetworkError = (error: any): boolean => {
    // Axios 네트워크 에러
    if (error?.code === 'ERR_NETWORK' || error?.code === 'ERR_INTERNET_DISCONNECTED') {
        return true;
    }
    // 네트워크 연결 실패
    if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        return true;
    }
    // 타임아웃
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        return true;
    }
    // 연결 거부
    if (error?.code === 'ECONNREFUSED') {
        return true;
    }

    return false;
};

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
