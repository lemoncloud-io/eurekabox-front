import { useCallback, useEffect, useState } from 'react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

import { setMultipleItems } from '../functions';
import type { StorageData, TransferStatus } from '../types';

interface ReceiverState extends TransferStatus {
    receivedData: StorageData;
    lastUpdated: string | null;
    isDataReceived: boolean;
    hasError: boolean;
    errorMessage?: string;
}

export const useStorageReceiver = (sourceDomain: string) => {
    console.log(sourceDomain);
    const [state, setState] = useState<ReceiverState>({
        isTransferring: false,
        status: '',
        error: null,
        receivedData: {},
        lastUpdated: null,
        isDataReceived: false,
        hasError: false,
    });

    const processReceivedData = useCallback(async (data: StorageData) => {
        try {
            setState(prev => ({
                ...prev,
                isTransferring: true,
                status: 'Receiving...',
            }));

            await createAsyncDelay(500);
            setState(prev => ({ ...prev, status: 'Saving...' }));

            setMultipleItems(data);

            setState(prev => ({
                ...prev,
                receivedData: data,
                lastUpdated: new Date().toLocaleString(),
                status: 'Receive completed!',
                isDataReceived: true,
            }));

            await createAsyncDelay(500);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            setState(prev => ({
                ...prev,
                status: 'Receive failed!',
                error: err,
                isDataReceived: false,
                hasError: true,
                errorMessage: error instanceof Error ? error.message : '데이터 처리 중 오류가 발생했습니다.',
            }));
            await createAsyncDelay(500);
        } finally {
            setState(prev => ({
                ...prev,
                isTransferring: false,
                status: '',
            }));
        }
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'TRANSFER_STORAGE') {
                processReceivedData(event.data.data);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [sourceDomain, processReceivedData]);

    return state;
};
