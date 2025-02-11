import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardPage, HomePage, UpdateContentPage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route path="/main" element={<HomePage />} />
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/:contentId" element={<UpdateContentPage />} />
            <Route path="*" element={<Navigate to="/home"></Navigate>} />
        </Routes>
    );
};
