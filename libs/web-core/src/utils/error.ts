export enum ErrorType {
    AUTHENTICATION = 'authentication', // 403 - 로그아웃 필요
    NETWORK = 'network', // 네트워크 연결 문제 - 재시도
    SERVER = 'server', // 5xx - 재시도
    CLIENT = 'client', // 4xx (403 제외) - 즉시 실패
    UNKNOWN = 'unknown', // 기타
}

interface ErrorClassification {
    type: ErrorType;
    shouldRetry: boolean;
    shouldLogout: boolean;
    message: string;
}

export const classifyError = (error: any): ErrorClassification => {
    const status = error?.status || error?.response?.status || error?.statusCode;

    // 403 인증 에러
    if (status === 403) {
        return {
            type: ErrorType.AUTHENTICATION,
            shouldRetry: false,
            shouldLogout: true,
            message: '인증이 만료되었습니다',
        };
    }

    // 네트워크 연결 에러 감지
    if (isNetworkError(error)) {
        return {
            type: ErrorType.NETWORK,
            shouldRetry: true,
            shouldLogout: false,
            message: '네트워크 연결을 확인해주세요',
        };
    }

    // 서버 에러 (5xx)
    if (status >= 500 && status < 600) {
        return {
            type: ErrorType.SERVER,
            shouldRetry: true,
            shouldLogout: false,
            message: '서버 오류가 발생했습니다',
        };
    }

    // 클라이언트 에러 (4xx, 403 제외)
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
