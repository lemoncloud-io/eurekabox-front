import { Navigate, Outlet } from 'react-router-dom';

import { AIRoutes } from '../../features/ai';
import { ChatBotButton } from '../../features/chatbots';
import { EditorRoutes } from '../../features/editor';
import { HomeRoutes } from '../../features/home';
import { StylingRoutes } from '../../features/styling/routes';

const AppLayout = () => {
    return (
        <>
            <Outlet />
            <ChatBotButton />
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
            { path: '*', element: <EditorRoutes /> },
        ],
    },
    { path: '*', element: <Navigate to="/home" replace /> },
];
