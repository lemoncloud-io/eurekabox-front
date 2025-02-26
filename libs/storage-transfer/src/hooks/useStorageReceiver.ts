import { useCallback, useEffect, useState } from 'react';

import { getOriginFromUrl, normalizeUrl, setMultipleItems } from '../functions';
import type { MessagePayload, StorageData, TransferStatus } from '../types';

interface ReceiverState extends TransferStatus {
    receivedData: StorageData;
    lastUpdated: string | null;
    isDataReceived: boolean;
    hasError: boolean;
    errorMessage?: string;
    isInitialized: boolean;
}

export const useStorageReceiver = (sourceDomain: string) => {
    const normalizedSourceDomain = normalizeUrl(sourceDomain);

    const [state, setState] = useState<ReceiverState>({
        isTransferring: false,
        status: 'Waiting for data...',
        error: null,
        receivedData: {},
        lastUpdated: null,
        isDataReceived: false,
        hasError: false,
        isInitialized: false,
    });

    // receiver가 준비되었음을 sender에게 알림
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10; // 최대 시도 횟수
        const retryInterval = 500; // 0.5초 간격

        const sendReadySignal = () => {
            const intervalId = setInterval(() => {
                if (window.opener) {
                    window.opener.postMessage(
                        {
                            type: 'RECEIVER_READY',
                        } as MessagePayload,
                        sourceDomain
                    );
                    clearInterval(intervalId);
                } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        clearInterval(intervalId);
                        console.error('Failed to find window.opener after multiple attempts');
                    }
                }
            }, retryInterval);

            return () => clearInterval(intervalId);
        };

        const cleanup = sendReadySignal();
        return cleanup;
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
            const eventOrigin = getOriginFromUrl(event.origin);
            const expectedOrigin = getOriginFromUrl(sourceDomain);

            if (eventOrigin !== expectedOrigin) {
                if (state.isInitialized) {
                    setState(prev => ({
                        ...prev,
                        hasError: true,
                        errorMessage: '잘못된 출처에서의 요청입니다.',
                        status: '오류 발생!',
                    }));
                }
                return;
            }

            if (!state.isInitialized) {
                setState(prev => ({
                    ...prev,
                    isInitialized: true,
                }));
            }

            if (event.data.type === 'TRANSFER_STORAGE') {
                processReceivedData(event.data.data);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [normalizedSourceDomain, processReceivedData]);

    return state;
};
