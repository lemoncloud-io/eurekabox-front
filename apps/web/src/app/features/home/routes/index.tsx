import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '../../../shared';
import { HomePage } from '../pages';

export const HomeRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};
