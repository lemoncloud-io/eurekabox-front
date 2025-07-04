import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

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

const ProtectedLayout = () => {
    return (
        <AuthGuard>
            <AppLayout />
        </AuthGuard>
    );
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedLayout />,
        children: [
            { index: true, element: <Navigate to="/home" replace /> },
            { path: 'home', element: <HomeRoutes /> },
            { path: 'styling/*', element: <StylingRoutes /> },
            { path: 'ai/*', element: <AIRoutes /> },
            // TODO: add AI Agents
            // { path: 'agents/*', element: <AgentsRoutes /> },
            { path: '*', element: <EditorRoutes /> },
        ],
    },
    {
        path: '/auth/*',
        element: <AuthRoutes />,
    },
]);

export const Router = () => {
    return <RouterProvider router={router} />;
};
