import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '../../../shared/components/DefaultLayout';
import { ChatBotPage } from '../chatbot/pages/ChatBotPage';

export const StylingRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<ChatBotPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};
