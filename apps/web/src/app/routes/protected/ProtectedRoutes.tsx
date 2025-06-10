import { Navigate, Outlet } from 'react-router-dom';

import { AIRoutes } from '../../features/ai';
import { ChatBotButton } from '../../features/chatbots';
import { EditorRoutes } from '../../features/editor';
import { HomeRoutes } from '../../features/home';
import { StylingRoutes } from '../../features/styling/routes';

const isProd = import.meta.env.VITE_ENV === 'PROD';

const AppLayout = () => {
    return (
        <>
            <Outlet />
            {!isProd && <ChatBotButton />}
        </>
    );
};

export const ProtectedRoutes = [
    {
        path: '/',
        element: <AppLayout />,
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
    { path: '*', element: <Navigate to="/home" replace /> },
];
