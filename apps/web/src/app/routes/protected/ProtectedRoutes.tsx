import { Navigate } from 'react-router-dom';

import { EditorRoutes } from '../../features/editor';
import { HomeRoutes } from '../../features/home';
import { StylingRoutes } from '../../features/styling/routes';

export const ProtectedRoutes = [
    { path: '/', element: <Navigate to="/home" replace /> },
    { path: `/home`, element: <HomeRoutes /> },
    { path: `/*`, element: <EditorRoutes /> },
    { path: `/styling/*`, element: <StylingRoutes /> },
    { path: '*', element: <Navigate to="/home" replace /> },
];
