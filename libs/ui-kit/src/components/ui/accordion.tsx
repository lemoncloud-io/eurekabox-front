import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';

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
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                'flex flex-1 items-center justify-between gap-1 p-1 pr-2 text-sm text-text-700 rounded-[4px] transition-all hover:bg-sidebar-hover text-left [&[data-state=open]>svg]:rotate-90',
                className
            )}
            {...props}
        >
            {children}
            {/* <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" /> */}
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
        className="cursor-pointer mt-[2px] pl-[14px] flex flex-1 items-center justify-between text-sm text-text-700 rounded-[4px] gap-1 transition-all text-left"
        {...props}
    >
        <div className={cn('', className)}>{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
