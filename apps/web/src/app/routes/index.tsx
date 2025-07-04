import { Navigate, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';

import { AuthGuard } from './guards';
import { AIRoutes } from '../features/ai';
import { AuthRoutes } from '../features/auth';
import { ChatBotButton } from '../features/chatbots';
import { EditorRoutes } from '../features/editor';
import { HomeRoutes } from '../features/home';
import { StylingRoutes } from '../features/styling/routes';

const isProd = import.meta.env.VITE_ENV === 'PROD';

const AppLayout = () => {
    return (
        <>
            <Outlet />
            {!isProd && <ChatBotButton />}
        </>
    );
};
export const ProtectedRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomeRoutes />} />
                <Route path="styling/*" element={<StylingRoutes />} />
                <Route path="ai/*" element={<AIRoutes />} />
                {/* TODO: add AI Agents */}
                {/* <Route path="agents/*" element={<AgentsRoutes />} /> */}
                <Route path="*" element={<EditorRoutes />} />
            </Route>
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
};

const router = createBrowserRouter([
    {
        path: '/*',
        element: (
            <AuthGuard>
                <ProtectedRoutes />
            </AuthGuard>
        ),
    },
    {
        path: '/auth/*',
        element: <AuthRoutes />,
    },
]);

export const Router = () => {
    return <RouterProvider router={router} />;
};
