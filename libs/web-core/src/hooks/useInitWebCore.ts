import { useEffect, useRef, useState } from 'react';

import { useWebCoreStore } from '../stores';

/**
 * Hook to manage web core initialization
 * - Handles initial authentication setup
 * - Manages initialization state
 * - Triggers core initialization on mount
 * @returns {boolean} Initialization status
 */
export const useInitWebCore = () => {
    const { initialize, isInitialized } = useWebCoreStore();
    const [localInitState, setLocalInitState] = useState<'idle' | 'initializing' | 'completed'>('idle');
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current || localInitState !== 'idle') {
            return;
        }

        hasInitialized.current = true;
        setLocalInitState('initializing');

        const runInitialization = async () => {
            try {
                await initialize();
                setLocalInitState('completed');
            } catch (error) {
                console.error('❌ WebCore initialization failed:', error);
                // TODO: error fallback
                setLocalInitState('completed');
            }
        };

        runInitialization();
    }, [initialize]);

    return isInitialized && localInitState === 'completed';
};
