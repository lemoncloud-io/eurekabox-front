import { useCallback, useState } from 'react';

import { webCore } from '@eurekabox/web-core';

import { getAllStorageData, getOriginFromUrl, transferData } from '../functions/index';
import type { StorageTransferResult, TransferStatus } from '../types';

export const useStorageTransfer = (targetDomain: string) => {
    const targetOrigin = getOriginFromUrl(targetDomain);

    const [transferStatus, setTransferStatus] = useState<TransferStatus>({
        isTransferring: false,
        status: '',
        error: null,
    });

    const handleTransfer = useCallback(async (): Promise<StorageTransferResult> => {
        try {
            setTransferStatus({
                isTransferring: true,
                status: 'Preparing to open a new window...',
                error: null,
            });

            const newWindow = window.open(targetDomain, '_blank');
            const token = await webCore.getSavedToken();
            const dataToShare = getAllStorageData(token);

            setTransferStatus(prev => ({ ...prev, status: 'Waiting for receiver ready...' }));
            await transferData(newWindow, targetOrigin, dataToShare);

            setTransferStatus(prev => ({ ...prev, status: 'Transfer complete!' }));
            return { success: true };
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            setTransferStatus({
                isTransferring: true,
                status: 'Transfer failed!',
                error: err,
            });
            return { success: false, error: err };
        } finally {
            setTransferStatus({
                isTransferring: false,
                status: '',
                error: null,
            });
        }
    }, [targetDomain]);

    return {
        transferStatus,
        handleTransfer,
    };
};
