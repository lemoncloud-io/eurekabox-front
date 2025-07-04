import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorFallback, GlobalLoader, LoadingFallback } from '@eurekabox/shared';
import { ThemeProvider } from '@eurekabox/theme';
import { Toaster } from '@eurekabox/ui-kit/components/ui/toaster';
import { useInitWebCore, useTokenRefresh, useWebCoreStore } from '@eurekabox/web-core';

import { Router } from './routes';
import i18n from '../i18n';

export function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
                retry: 1,
            },
        },
    });

    const isWebCoreReady = useInitWebCore();
    const { isAuthenticated } = useWebCoreStore();
    const { isInitialized: isTokenInitialized } = useTokenRefresh(isWebCoreReady);
    const canRenderApp = isWebCoreReady && (!isAuthenticated || isTokenInitialized);

    if (!canRenderApp) {
        return <LoadingFallback />;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <Suspense fallback={<LoadingFallback />}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <HelmetProvider>
                        <QueryClientProvider client={queryClient}>
                            <ThemeProvider>
                                <Router />
                                <GlobalLoader />
                                <Toaster />
                            </ThemeProvider>
                            {/*{process.env.NODE_ENV !== 'prod' && <ReactQueryDevtools />}*/}
                        </QueryClientProvider>
                    </HelmetProvider>
                </ErrorBoundary>
            </Suspense>
        </I18nextProvider>
    );
}

export default App;
