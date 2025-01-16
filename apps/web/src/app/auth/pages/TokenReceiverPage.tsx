import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingFallback } from '@eurekabox/shared';
import { useStorageReceiver } from '@eurekabox/storage-transfer';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { useWebCoreStore, webCore } from '@eurekabox/web-core';

export const TokenReceiverPage = () => {
    const setIsAuthenticated = useWebCoreStore(state => state.setIsAuthenticated);
    const navigate = useNavigate();
    const checkResultCalled = useRef(false);

    const { receivedData, status, isDataReceived, hasError, errorMessage, isInitialized } = useStorageReceiver(
        import.meta.env.VITE_CODES_HOST.toLowerCase()
    );

    useEffect(() => {
        // isDataReceived가 true일 때만 처리 시작
        if (checkResultCalled.current || !isDataReceived) {
            return;
        }
        checkResultCalled.current = true;

        const buildCredentialsByStorage = async () => {
            try {
                await webCore.buildCredentialsByStorage();
                setIsAuthenticated(true);
                navigate('/home', { replace: true });
            } catch (error) {
                toast({ description: '인증 처리 중 오류가 발생했습니다.', variant: 'destructive' });
                navigate('/auth/login', { replace: true });
            }
        };

        buildCredentialsByStorage();
    }, [receivedData, isDataReceived, hasError]);

    // 타임아웃 처리
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isDataReceived && !hasError) {
                toast({
                    description: '데이터 수신 시간이 초과되었습니다.',
                    variant: 'destructive',
                });
                navigate('/auth/login', { replace: true });
            }
        }, 20000);

        return () => clearTimeout(timeoutId);
    }, [isDataReceived, hasError]);

    if (hasError && isInitialized) {
        return <LoadingFallback message={errorMessage || '오류가 발생했습니다.'} />;
    }

    return <LoadingFallback message={status} />;
};
