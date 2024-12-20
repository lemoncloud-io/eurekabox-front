import { useEffect } from 'react';

import { useWebCoreStore } from '../stores';

export const useInitWebCore = () => {
    const initializeCore = useWebCoreStore(state => state.initialize);
    const isInitialized = useWebCoreStore(state => state.isInitialized);

    useEffect(() => {
        initializeCore();
    }, [initializeCore]);

    return isInitialized;
};
