import { Moon, Sun } from 'lucide-react';
import { Button } from '@lemonote/ui-kit/components/ui/button';
import { useEffect, useState } from 'react';
import { useTheme } from '@lemonote/theme';

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
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hover:text-primary"
        >
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
