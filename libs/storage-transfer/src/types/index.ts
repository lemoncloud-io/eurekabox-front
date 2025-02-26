export interface StorageData {
    [key: string]: any;
}

export interface TransferStatus {
    isTransferring: boolean;
    status: string;
    error?: Error | null;
}

export interface StorageTransferResult {
    success: boolean;
    error?: Error | null;
}

export interface MessagePayload {
    type: 'RECEIVER_READY' | 'TRANSFER_STORAGE';
    data?: StorageData;
}
