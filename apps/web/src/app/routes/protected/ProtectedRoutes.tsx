import { Navigate } from 'react-router-dom';

export const ProtectedRoutes = [
    { path: `/home/*`, element: <div>PROTECTED</div> },
    { path: '*', element: <Navigate to="/home" replace /> },
    { path: '/', element: <Navigate to="/home" replace /> },
];
