import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage, OAuthResponsePage } from '../pages';

export const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="oauth-response" element={<OAuthResponsePage />} />
            <Route path="*" element={<Navigate to="/auth/login"></Navigate>} />
        </Routes>
    );
};
