import { Navigate, useLocation } from 'react-router-dom';

import { useWebCoreStore } from '@eurekabox/web-core';

interface AuthGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, redirectTo = '/auth/login' }) => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};
