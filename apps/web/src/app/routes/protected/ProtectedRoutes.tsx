import { Navigate } from 'react-router-dom';

import { HomeRoutes } from '../../home';

export const ProtectedRoutes = [
    { path: `/home/*`, element: <HomeRoutes /> },
    { path: '*', element: <Navigate to="/home" replace /> },
    { path: '/', element: <Navigate to="/home" replace /> },
];
