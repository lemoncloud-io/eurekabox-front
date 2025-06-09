export interface ListResult<T, R = any> {
    /**
     * total searched count
     */
    total?: number;
    /**
     * max items count in the page
     */
    limit?: number;
    /**
     * current page number.
     */
    page?: number;
    /**
     * (optional) time took in sec
     */
    took?: number;
    /**
     * items searched
     */
    list: T[];
    /**
     * (optional) aggr list
     */
    aggr?: R[];
}

export interface PaginationType<T> {
    page: number | undefined;
    total: number | undefined;
    data: T;
}

export declare type Params = {
    [key: string]: any;
};
