import { Navigate } from 'react-router-dom';

import { HomeRoutes } from '../../home';

export const ProtectedRoutes = [
    { path: `/*`, element: <HomeRoutes /> },
    { path: '*', element: <Navigate to="/" replace /> },
    { path: '/', element: <Navigate to="/" replace /> },
];
