import { Navigate, Route, Routes } from 'react-router-dom';

import { EditorPage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="*" element={<Navigate to="/home"></Navigate>} />
        </Routes>
    );
};
