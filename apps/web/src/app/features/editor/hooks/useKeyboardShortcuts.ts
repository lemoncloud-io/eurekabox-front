import { useEffect } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlOrMeta: boolean;
    handler: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach(({ key, ctrlOrMeta, handler }) => {
                if (event.key === key && ctrlOrMeta && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    handler();
                }
            });
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
