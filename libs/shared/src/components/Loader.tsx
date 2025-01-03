import { Loader2 } from 'lucide-react';

import { cn } from '@eurekabox/ui-kit';

const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
};

interface LoaderProps {
    size?: keyof typeof sizes;
    message?: string;
    className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'sm', message = 'Loading...', className = '' }) => {
    return (
        <div className={cn('animate-pulse flex items-center space-x-2 text-primary', className)}>
            <Loader2 className={cn('animate-spin', sizes[size])} />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};
