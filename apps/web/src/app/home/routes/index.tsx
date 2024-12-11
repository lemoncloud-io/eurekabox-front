import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardPage, UpdateContentPage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/:contentId" element={<UpdateContentPage />} />
            <Route path="*" element={<Navigate to="/home"></Navigate>} />
        </Routes>
    );
};
