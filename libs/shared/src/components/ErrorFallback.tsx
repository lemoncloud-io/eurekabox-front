import { ComponentType } from 'react';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card } from '@eurekabox/ui-kit/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-6 space-y-6 glassmorphism">
                <div className="text-center space-y-2">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h2 className="text-2xl font-bold gradient-text">Oops! Something went wrong</h2>
                </div>

                <p className="text-center text-muted-foreground">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                <div className="bg-muted/50 rounded-lg p-4 overflow-auto">
                    <pre className="text-sm">{error.message}</pre>
                </div>

                <div className="flex justify-center">
                    <Button onClick={resetErrorBoundary} className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>Try again</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
};
