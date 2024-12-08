import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@lemonote/ui-kit/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { useInitWebCore, useRefreshToken } from '@lemonote/web-core';

import { Router } from './routes';
import { ErrorFallback, LoadingFallback, GlobalLoader } from '@lemonote/shared';

export function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
            },
        },
    });

    const isInitialized = useInitWebCore();
    useRefreshToken();

    if (!isInitialized) {
        return <LoadingFallback />;
    }

    return (
        <Suspense fallback={LoadingFallback}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <HelmetProvider>
                    <QueryClientProvider client={queryClient}>
                        <Router />
                        <GlobalLoader />
                        <Toaster />
                        {process.env.NODE_ENV !== 'prod' && <ReactQueryDevtools />}
                    </QueryClientProvider>
                </HelmetProvider>
            </ErrorBoundary>
        </Suspense>
    );
}

export default App;
