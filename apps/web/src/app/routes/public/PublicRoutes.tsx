import { Navigate } from 'react-router-dom';

import { AuthRoutes } from '../../auth';
import { Home } from '../protected';

export const PublicRoutes = [
    { path: `/auth/*`, element: <Home /> },
    { path: '/', element: <Navigate to="/auth" /> },
    { path: '*', element: <Navigate to="/auth" /> },
];
