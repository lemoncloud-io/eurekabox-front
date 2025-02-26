import { Navigate, Route, Routes } from 'react-router-dom';

import { EditorPage } from '../pages';

export const EditorRoutes = () => {
    return (
        <Routes>
            <Route path="/:contentId" element={<EditorPage />} />
            <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
    );
};
