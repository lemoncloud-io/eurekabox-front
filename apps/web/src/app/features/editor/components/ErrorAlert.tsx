import { Alert, AlertDescription } from '@eurekabox/lib/components/ui/alert';

interface ErrorAlertProps {
    error: Error | null;
    onRetry?: () => void;
    retryLabel: string;
    errorMessage: string;
    className?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const POSITION_CLASSES = {
    'top-right': 'fixed top-20 right-4 z-50',
    'top-left': 'fixed top-20 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
} as const;

export const ErrorAlert = ({
    error,
    onRetry = () => window.location.reload(),
    retryLabel,
    errorMessage,
    className = 'w-80',
    position = 'top-right',
}: ErrorAlertProps) => {
    if (!error) {
        return null;
    }

    const positionClass = POSITION_CLASSES[position];

    return (
        <Alert variant="destructive" className={`${positionClass} ${className}`} role="alert" aria-live="assertive">
            <AlertDescription>
                {errorMessage}
                <button
                    onClick={onRetry}
                    className="ml-2 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                    aria-label={`${retryLabel} - ${errorMessage}`}
                >
                    {retryLabel}
                </button>
            </AlertDescription>
        </Alert>
    );
};
