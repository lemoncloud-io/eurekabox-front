import { Navigate } from 'react-router-dom';

import { AIRoutes } from '../../features/ai';
import { EditorRoutes } from '../../features/editor';
import { HomeRoutes } from '../../features/home';
import { StylingRoutes } from '../../features/styling/routes';

export const ProtectedRoutes = [
    { path: '/', element: <Navigate to="/home" replace /> },
    { path: `/home`, element: <HomeRoutes /> },
    { path: `/styling/*`, element: <StylingRoutes /> },
    { path: `/ai/*`, element: <AIRoutes /> },
    { path: `/*`, element: <EditorRoutes /> },
    { path: '*', element: <Navigate to="/home" replace /> },
];
