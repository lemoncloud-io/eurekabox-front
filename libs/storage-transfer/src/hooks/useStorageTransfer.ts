import { useCallback, useState } from 'react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

import { webCore } from '@eurekabox/web-core';

import { getAllStorageData, transferData } from '../functions/index';
import type { StorageTransferResult, TransferStatus } from '../types';



export const useStorageTransfer = (targetDomain: string) => {
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

            await createAsyncDelay(200);
            setTransferStatus(prev => ({ ...prev, status: 'Transferring data...' }));

            await transferData(newWindow, targetDomain, dataToShare);
            setTransferStatus(prev => ({ ...prev, status: 'Transfer complete!' }));

            await createAsyncDelay(500);
            return { success: true };
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            setTransferStatus({
                isTransferring: true,
                status: 'Transfer failed!',
                error: err,
            });
            await createAsyncDelay(500);
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
