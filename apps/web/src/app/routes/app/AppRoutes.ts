import { useRoutes } from 'react-router-dom';

import { ProtectedRoutes } from '../protected';

import { useWebCoreStore } from '@lemonote/web-core';

import { CommonRoutes } from '../common';
import { PublicRoutes } from '../public';

export const AppRoutes = () => {
    const isAuthenticated = useWebCoreStore(state => state.isAuthenticated);

    const routes = isAuthenticated ? [...ProtectedRoutes, ...PublicRoutes] : PublicRoutes;

    return useRoutes([...routes, ...CommonRoutes]);
};
