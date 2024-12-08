import { Navigate, Route, Routes } from 'react-router-dom';

import { CreateContentPage, DefaultContentPage, UpdateContentPage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultContentPage />} />
            <Route path="/create" element={<CreateContentPage />} />
            <Route path="/:contentId" element={<UpdateContentPage />} />
            <Route path="*" element={<Navigate to="/home"></Navigate>} />
        </Routes>
    );
};
