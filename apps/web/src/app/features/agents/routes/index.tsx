import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '../../../shared';
import { AgentPage } from '../pages';

export const AgentsRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<AgentPage />} />
                <Route path="/:id" element={<AgentPage />} />
                <Route path="*" element={<Navigate to="/agents" />} />
            </Route>
        </Routes>
    );
};
