import { Navigate } from 'react-router-dom';

import { AuthRoutes } from '../../auth';

export const PublicRoutes = [
    { path: `/auth/*`, element: <AuthRoutes /> },
    { path: '/', element: <Navigate to="/auth" /> },
    { path: '*', element: <Navigate to="/auth" /> },
];
