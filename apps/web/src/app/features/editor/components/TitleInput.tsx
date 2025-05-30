import { forwardRef } from 'react';

interface TitleInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder: string;
    maxLength: number;
    className?: string;
}

export const TitleInput = forwardRef<HTMLInputElement, TitleInputProps>(
    (
        {
            value,
            onChange,
            onKeyDown,
            placeholder,
            maxLength,
            className = 'w-full bg-background text-[24px] font-semibold border-none focus:outline-none caret-text-text pb-4',
        },
        ref
    ) => {
        return (
            <input
                type="text"
                ref={ref}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                className={className}
                placeholder={placeholder}
                maxLength={maxLength}
            />
        );
    }
);

TitleInput.displayName = 'TitleInput';
