import { useCallback, useEffect, useState } from 'react';


import { setMultipleItems } from '../functions';
import type { MessagePayload, StorageData, TransferStatus } from '../types';

interface ReceiverState extends TransferStatus {
    receivedData: StorageData;
    lastUpdated: string | null;
    isDataReceived: boolean;
    hasError: boolean;
    errorMessage?: string;
}

export const useStorageReceiver = (sourceDomain: string) => {
    const [state, setState] = useState<ReceiverState>({
        isTransferring: false,
        status: '',
        error: null,
        receivedData: {},
        lastUpdated: null,
        isDataReceived: false,
        hasError: false,
    });

    // receiver가 준비되었음을 sender에게 알림
    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage(
                {
                    type: 'RECEIVER_READY',
                } as MessagePayload,
                sourceDomain
            );
        }
    }, [sourceDomain]);

    const processReceivedData = useCallback(async (data: StorageData) => {
        try {
            setState(prev => ({
                ...prev,
                isTransferring: true,
                status: 'Receiving...',
                hasError: false,
                errorMessage: undefined,
            }));

            setMultipleItems(data);

            setState(prev => ({
                ...prev,
                receivedData: data,
                lastUpdated: new Date().toLocaleString(),
                status: 'Receive completed!',
                isDataReceived: true,
            }));
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
        } finally {
            setState(prev => ({
                ...prev,
                isTransferring: false,
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
