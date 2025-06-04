import * as React from 'react';

import { cn } from '@eurekabox/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex w-full h-[37px] rounded-lg border border-input bg-transparent pr-[14px] pl-3 py-2 text-sm font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#00243A] dark:focus:border-white',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
