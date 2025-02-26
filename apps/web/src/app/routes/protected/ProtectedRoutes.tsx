import { Navigate } from 'react-router-dom';

import { EditorRoutes } from '../../features/editor';
import { HomeRoutes } from '../../features/home';

export const ProtectedRoutes = [
    { path: '/', element: <Navigate to="/home" replace /> },
    { path: `/home`, element: <HomeRoutes /> },
    { path: `/*`, element: <EditorRoutes /> },
    { path: '*', element: <Navigate to="/home" replace /> },
];
