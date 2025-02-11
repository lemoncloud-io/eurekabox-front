import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronRight, FileText } from 'lucide-react';

import { cn } from '@eurekabox/ui-kit/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { showIcon?: boolean }
>(({ className, children, showIcon = true, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                'flex flex-1 items-center justify-between gap-1 p-1 pr-2 text-sm text-text-700 rounded-[4px] transition-all hover:bg-sidebar-hover text-left [&[data-state=open]>svg]:rotate-90',
                className
            )}
            {...props}
        >
            {showIcon ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-text-700 transition-transform duration-200" />
            ) : (
                <div className="h-4 w-4 shrink-0" />
            )}
            <div className="flex-1 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {children}
            </div>
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className="cursor-pointer mt-[2px] pl-[14px] flex flex-1 items-center justify-between gap-1 text-sm text-text-700 rounded-[4px] transition-all hover:bg-sidebar-hover text-left"
        {...props}
    >
        <div className="p-1 flex items-center">
            <ChevronRight className="h-4 w-4 shrink-0 text-text-700 transition-transform duration-200" />
            <div className="flex-1 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {children}
            </div>
        </div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
