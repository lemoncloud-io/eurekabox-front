import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from './app';

export const Router = () => {
    return (
        <BrowserRouter>
            <AppRoutes></AppRoutes>
        </BrowserRouter>
    );
};
