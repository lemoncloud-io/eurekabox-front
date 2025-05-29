import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '../../../shared';
import { ChatPage } from '../pages';

export const AIRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:id" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/ai/chat" />} />
            </Route>
        </Routes>
    );
};
