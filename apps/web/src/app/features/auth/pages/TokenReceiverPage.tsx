import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LoadingFallback } from '@eurekabox/shared';
import { useStorageReceiver } from '@eurekabox/storage-transfer';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { useWebCoreStore, webCore } from '@eurekabox/web-core';

export const TokenReceiverPage = () => {
    const { t } = useTranslation();
    const setIsAuthenticated = useWebCoreStore(state => state.setIsAuthenticated);
    const navigate = useNavigate();
    const checkResultCalled = useRef(false);

    const { receivedData, status, isDataReceived, hasError, errorMessage, isInitialized } = useStorageReceiver(
        import.meta.env.VITE_CODES_HOST.toLowerCase()
    );

    useEffect(() => {
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
                toast({ description: t('tokenReceiver.error.auth'), variant: 'destructive' });
                navigate('/auth/login', { replace: true });
            }
        };

        buildCredentialsByStorage();
    }, [receivedData, isDataReceived, hasError, t]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isDataReceived && !hasError) {
                toast({
                    description: t('tokenReceiver.error.timeout'),
                    variant: 'destructive',
                });
                navigate('/auth/login', { replace: true });
            }
        }, 20000);

        return () => clearTimeout(timeoutId);
    }, [isDataReceived, hasError, t]);

    if (hasError && isInitialized) {
        return <LoadingFallback message={errorMessage || t('tokenReceiver.error.general')} />;
    }

    return <LoadingFallback message={status} />;
};
