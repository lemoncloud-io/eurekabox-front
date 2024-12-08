import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWebCoreStore, createCredentialsByProvider } from '@lemonote/web-core';
import { LoadingFallback } from '@lemonote/shared';
import { toast } from '@lemonote/ui-kit/hooks/use-toast';

export const OAuthResponsePage = () => {
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
            const isSuccess = code.length > 5;
            if (isSuccess) {
                await createCredentialsByProvider(provider, code);
                setIsAuthenticated(true);
                navigate('/home');
                return;
            }
            // Error occurred!
            toast({ description: '에러가 발생했습니다.', variant: 'destructive' });
            navigate('/auth/login');
        };

        checkLoginResult();
    }, [location.search]);

    return <LoadingFallback message={'Signing...'} />;
};

export default OAuthResponsePage;
