import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage, LogoutPage, OAuthResponsePage, TokenReceiverPage } from '../pages';

export const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="token-receiver" element={<TokenReceiverPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="logout" element={<LogoutPage />} />
            <Route path="oauth-response" element={<OAuthResponsePage />} />
            <Route path="*" element={<Navigate to="/auth/login"></Navigate>} />
        </Routes>
    );
};
