import { useContext } from 'react';

import { ThemeProviderContext } from '../provider';

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    const { theme } = context;

    return {
        ...context,
        theme,
        isDarkTheme:
            theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    };
};
