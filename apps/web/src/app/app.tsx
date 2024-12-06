import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@lemonote/ui-kit/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { useInitWebCore, useRefreshToken } from '@lemonote/web-core';

import { Router } from './routes';

const ErrorFallback = () => {
    const onClickRefresh = () => window.location.assign(window.location.origin);

    return (
        <div className="text-red-500 w-screen h-screen flex flex-col justify-center items-center" role="alert">
            <h2 className="text-lg font-semibold">Oops, something went wrong :( </h2>
            <button className="mt-4" onClick={onClickRefresh}>
                Refresh
            </button>
        </div>
    );
};

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
        return <div>TODO: add loader</div>;
    }

    return (
        <Suspense fallback={<div>TODO: add loader</div>}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <HelmetProvider>
                    <QueryClientProvider client={queryClient}>
                        <Router />
                        <Toaster />
                        {process.env.NODE_ENV !== 'prod' && <ReactQueryDevtools />}
                    </QueryClientProvider>
                </HelmetProvider>
            </ErrorBoundary>
        </Suspense>
    );
}

export default App;
