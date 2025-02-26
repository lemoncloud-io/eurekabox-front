import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@eurekabox/theme';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-accent"
        >
            {theme === 'light' ? <Moon width={24} height={24} /> : <Sun width={24} height={24} />}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
