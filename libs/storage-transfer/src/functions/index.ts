import type { MessagePayload, StorageData } from '../types';

export const getAllStorageData = (storageData: { [key: string]: string }): StorageData => {
    const data: StorageData = {};
    Object.entries(storageData).forEach(([key, value]) => {
        if (value) {
            try {
                data[key] = JSON.parse(value);
            } catch (e) {
                console.warn(`Error parsing ${key}:`, e);
                data[key] = value;
            }
        }
    });
    return data;
};

export const setMultipleItems = (data: StorageData): void => {
    Object.entries(data).forEach(([key, value]) => {
        try {
            // 이미 문자열화된 JSON인지 확인
            const valueToStore = (() => {
                if (typeof value === 'string') {
                    try {
                        // 이미 JSON 문자열인지 확인
                        JSON.parse(value);
                        return value; // 이미 JSON 문자열이면 그대로 반환
                    } catch {
                        return value; // JSON 파싱에 실패하면 일반 문자열로 간주
                    }
                }
                return JSON.stringify(value); // 문자열이 아닌 경우 JSON.stringify 실행
            })();

            localStorage.setItem(key, valueToStore);
        } catch (e) {
            console.error(`Error storing ${key}:`, e);
        }
    });
};

export const transferData = async (
    newWindow: Window | null,
    targetOrigin: string,
    data: StorageData
): Promise<void> => {
    if (!newWindow || newWindow.closed) {
        throw new Error('The target window is not valid.');
    }

    await waitForReceiverReady(newWindow);

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            newWindow.postMessage(
                {
                    type: 'TRANSFER_STORAGE',
                    data: data,
                } as MessagePayload,
                targetOrigin
            );
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const waitForReceiverReady = (newWindow: Window | null, timeout = 10000): Promise<void> => {
    if (!newWindow || newWindow.closed) {
        throw new Error('Invalid window');
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout!'));
        }, timeout);

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'RECEIVER_READY') {
                cleanup();
                resolve();
            }
        };

        const cleanup = () => {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
        };

        window.addEventListener('message', handleMessage);
    });
};
