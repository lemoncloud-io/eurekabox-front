import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '../../../shared/components/DefaultLayout';
import { ChatBotPage } from '../chatbot/pages/ChatBotPage';
import { ChatBotTestPage } from '../chatbot/pages/ChatBotTestPage';

export const StylingRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<ChatBotPage />} />
                <Route path="/test" element={<ChatBotTestPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};
