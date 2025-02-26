import { Navigate, useLocation } from 'react-router-dom';

import { AuthRoutes } from '../../features/auth';

const AuthRedirect = () => {
    const location = useLocation();
    return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
};

export const PublicRoutes = [
    { path: `/auth/*`, element: <AuthRoutes /> },
    { path: '/', element: <AuthRedirect /> },
    {
        path: '*',
        element: <AuthRedirect />,
    },
];
