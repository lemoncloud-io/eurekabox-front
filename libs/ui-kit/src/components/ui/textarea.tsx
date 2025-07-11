import * as React from 'react';

import { cn } from '@eurekabox/ui-kit/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex min-h-[106px] w-full rounded-md border border-chatbot-line resize-none bg-transparent px-[14px] py-2 text-sm font-medium placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
