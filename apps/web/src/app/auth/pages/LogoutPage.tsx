import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWebCoreStore, createCredentialsByProvider } from '@lemonote/web-core';
import { LoadingFallback } from '@lemonote/shared';
import { toast } from '@lemonote/ui-kit/hooks/use-toast';

export const LogoutPage = () => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);
    const logout = useWebCoreStore(state => state.logout);
    const navigate = useNavigate();

    useEffect(() => {
        logout();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
        }
    }, [isAuthenticated]);

    return <LoadingFallback message={'Sign Out'} />;
};
