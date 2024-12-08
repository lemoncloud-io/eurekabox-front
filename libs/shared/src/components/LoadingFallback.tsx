import { Card } from '@lemonote/ui-kit/components/ui/card';
import { Loader2 } from 'lucide-react';
import { GlobalLoader } from './GlobalLoader';

interface LoadingFallbackProps {
    message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card p-6 rounded-lg shadow-lg glassmorphism">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                        <span className="text-lg font-bold gradient-text">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
