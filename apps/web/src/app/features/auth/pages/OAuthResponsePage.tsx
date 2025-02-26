import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { LoadingFallback } from '@eurekabox/shared';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import { createCredentialsByProvider, useWebCoreStore } from '@eurekabox/web-core';

export const OAuthResponsePage = () => {
    const { t } = useTranslation();
    const setIsAuthenticated = useWebCoreStore(state => state.setIsAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();
    const checkLoginResultCalled = useRef(false);

    useEffect(() => {
        if (checkLoginResultCalled.current) {
            return;
        }
        checkLoginResultCalled.current = true;

        const checkLoginResult = async () => {
            const routeParams = new URLSearchParams(location.search);
            const code = routeParams.get('code') || '';
            const provider = routeParams.get('provider') || '';
            const stateParam = routeParams.get('state') || '';
            const isSuccess = code.length > 5;

            if (isSuccess) {
                await createCredentialsByProvider(provider, code);
                setIsAuthenticated(true);

                let redirectTo = '/home';
                try {
                    const stateObj = JSON.parse(decodeURIComponent(stateParam));
                    redirectTo = stateObj.from || '/home';
                } catch (e) {
                    console.warn(t('oauth.error.stateParam'), e);
                }

                navigate(redirectTo, { replace: true });
                return;
            }

            toast({ description: t('oauth.error.general'), variant: 'destructive' });
            navigate('/auth/login');
        };

        checkLoginResult();
    }, [location.search, t]);

    return <LoadingFallback message={t('oauth.signing')} />;
};
