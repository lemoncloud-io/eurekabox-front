import { useEffect, useRef } from 'react';

import { useWebCoreStore } from '../stores';

/**
 * Hook to manage web core initialization
 * - Handles initial authentication setup
 * - Manages initialization state
 * - Triggers core initialization on mount
 * @returns {boolean} Initialization status
 */
export const useInitWebCore = () => {
    const initializeCore = useWebCoreStore(state => state.initialize);
    const isInitialized = useWebCoreStore(state => state.isInitialized);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;
        initializeCore();
    }, [initializeCore]);

    return isInitialized;
};
