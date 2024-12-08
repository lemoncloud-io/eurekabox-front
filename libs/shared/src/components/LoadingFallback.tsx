import { Card } from '@lemonote/ui-kit/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
    message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex items-center justify-center min-h-[200px] w-screen h-screen">
            <Card className="p-6 space-y-4 glassmorphism">
                <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-medium gradient-text">{message}</p>
                </div>
            </Card>
        </div>
    );
};
