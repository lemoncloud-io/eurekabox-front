import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LoadingFallback } from '@eurekabox/shared';
import type { StorageData } from '@eurekabox/storage-transfer';
import { useStorageReceiver } from '@eurekabox/storage-transfer';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { useWebCoreStore, webCore } from '@eurekabox/web-core';

export const TokenReceiverPage = () => {
    const setIsAuthenticated = useWebCoreStore(state => state.setIsAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();
    const checkResultCalled = useRef(false);

    const { receivedData, isTransferring, status, isDataReceived, hasError, errorMessage } = useStorageReceiver(
        import.meta.env.VITE_CODES_HOST.toLowerCase()
    );

    // 받은 데이터 활용
    useEffect(() => {
        console.log(isDataReceived, hasError);
        // 이미 처리했거나 아직 데이터를 받지 않았고 에러도 없는 경우 스킵
        if (checkResultCalled.current || (!isDataReceived && !hasError)) {
            return;
        }
        checkResultCalled.current = true;

        const buildCredentialsByStorage = async (receivedData: StorageData) => {
            if (Object.keys(receivedData).length > 0) {
                await webCore.buildCredentialsByStorage();
                setIsAuthenticated(true);
                const redirectTo = '/home';
                navigate(redirectTo, { replace: true });
                return;
            }

            toast({ description: '에러가 발생했습니다.', variant: 'destructive' });
            navigate('/auth/login');
        };

        buildCredentialsByStorage(receivedData);
    }, [receivedData, isDataReceived, hasError, errorMessage]);

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
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [isDataReceived, hasError]);

    if (hasError) {
        return <LoadingFallback message={errorMessage || '오류가 발생했습니다.'} />;
    }

    return <LoadingFallback message={status} />;
};
