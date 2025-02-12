import { Navigate, Route, Routes } from 'react-router-dom';

import { HomePage, UpdateContentPage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/:contentId" element={<UpdateContentPage />} />
            <Route path="*" element={<Navigate to="/home"></Navigate>} />
        </Routes>
    );
};
