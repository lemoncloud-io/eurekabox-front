import { useCallback, useEffect, useState } from 'react';

let globalHeaderContent: string | null = null;
let globalSetHeaderContent: ((content: string | null) => void) | null = null;

export const usePageHeader = () => {
    const [headerContent, setHeaderContent] = useState<string | null>(globalHeaderContent);

    useEffect(() => {
        globalSetHeaderContent = setHeaderContent;
        setHeaderContent(globalHeaderContent);
    }, []);

    const setPageHeader = useCallback((content: string | null) => {
        globalHeaderContent = content;
        if (globalSetHeaderContent) {
            globalSetHeaderContent(content);
        }
    }, []);

    const clearPageHeader = useCallback(() => {
        setPageHeader(null);
    }, [setPageHeader]);

    return {
        headerContent,
        setPageHeader,
        clearPageHeader,
    };
};
