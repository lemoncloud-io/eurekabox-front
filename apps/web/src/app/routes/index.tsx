import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { useWebCoreStore } from '@eurekabox/web-core';

import { ProtectedRoutes } from './protected';
import { PublicRoutes } from './public';

export const Router = () => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);

    const routes = isAuthenticated ? [...ProtectedRoutes, ...PublicRoutes] : PublicRoutes;
    const router = createBrowserRouter([...routes]);

    return <RouterProvider router={router} />;
};
