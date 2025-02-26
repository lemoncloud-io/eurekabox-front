import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { toast } from '@eurekabox/lib/hooks/use-toast';
import { LoadingFallback } from '@eurekabox/shared';
import { useWebCoreStore } from '@eurekabox/web-core';

export const LogoutPage = () => {
    const { t } = useTranslation();
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);
    const logout = useWebCoreStore(state => state.logout);
    const navigate = useNavigate();

    useEffect(() => {
        toast({ description: t('oauth.logout') });
        logout();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
        }
    }, [isAuthenticated]);

    return <LoadingFallback message={t('editor.logout')} />;
};
