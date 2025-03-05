import type { AxiosRequestConfig, GenericAbortSignal } from 'axios';

import type { ContentBody, ContentView, ElementBody, ElementView } from '@lemoncloud/eureka-contents-api';
import type { Params } from '@lemoncloud/lemon-web-core';

import type { ListResult } from '@eurekabox/shared';
import { webCore } from '@eurekabox/web-core';

import type { UpdateActivityDTO, UpdateContentDTO, UpdateElementDTO } from '../types';

const CONTENT_ENDPOINT = import.meta.env.VITE_CONTENT_ENDPOINT.toLowerCase();
const IMAGE_API_ENDPOINT = import.meta.env.VITE_IMAGE_API_ENDPOINT.toLowerCase();

export interface UploadedImage {
    contentLength: number;
    contentType: string;
    createdAt: number;
    hash: string;
    height?: number;
    id: string;
    location: string;
    name: string;
    ns: string;
    origin: string;
    type: string;
    url: string;
    width?: number;
}

export const fetchContents = async (params: Params): Promise<ListResult<ContentView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/contents/0/list`,
        })
        .setParams({ limit: 10, ...params })
        .execute<ListResult<ContentView>>();

    return { ...data };
};

export const searchContents = async (params: Params): Promise<ListResult<ContentView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/contents/0/list`,
        })
        .setParams({ limit: 10, ...params })
        .execute<ListResult<ContentView>>();

    return { ...data };
};

export const fetchContentById = async (contentId?: string, signal?: GenericAbortSignal): Promise<ContentView> => {
    if (!contentId) {
        throw new Error('fetchContentById: @contentId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/contents/${contentId}/detail`,
        })
        .addAxiosRequestConfig({
            ...(signal && { signal }),
        } as AxiosRequestConfig)
        .setParams({ activity: 1 })
        .execute<ContentView>();

    return { ...data };
};

export const createContent = async (contentBody: ContentBody): Promise<ContentView> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CONTENT_ENDPOINT}/contents/0`,
        })
        .setBody({ ...contentBody })
        .execute<ContentView>();

    return data;
};

export const updateContent = async (updateContentDTO: UpdateContentDTO): Promise<ContentView> => {
    const { contentId, ...data } = updateContentDTO;
    if (!contentId) {
        throw new Error('updateContent: @contentId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CONTENT_ENDPOINT}/contents/${contentId}`,
        })
        .setBody(data)
        .execute<ContentView>();

    return response.data;
};

export const deleteContent = async (contentId: string): Promise<ContentView> => {
    if (!contentId) {
        throw new Error('deleteContent: @contentId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'DELETE',
            baseURL: `${CONTENT_ENDPOINT}/contents/${contentId}`,
        })
        .setBody({})
        .execute<ContentView>();

    return data;
};

export const fetchElements = async (params: Params): Promise<ListResult<ElementView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/elements/0/list`,
        })
        .setParams({ limit: 10, ...params })
        .execute<ListResult<ElementView>>();

    return { ...data };
};

export const fetchElementById = async (elementId?: string, signal?: GenericAbortSignal): Promise<ElementView> => {
    if (!elementId) {
        throw new Error('fetchElementById: @elementId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/elements/${elementId}/detail`,
        })
        .addAxiosRequestConfig({
            ...(signal && { signal }),
        } as AxiosRequestConfig)
        .execute<ElementView>();

    return { ...data };
};

export const createElement = async (elementBody: ElementBody): Promise<ElementView> => {
    const { contentId, ...data } = elementBody;
    if (!contentId) {
        throw new Error('createElement: .contentId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CONTENT_ENDPOINT}/contents/${contentId}/elements`,
        })
        .setBody({ ...data })
        .execute<ElementView>();

    return response.data;
};

export const updateElement = async (updateElementDTO: UpdateElementDTO): Promise<ElementView> => {
    const { elementId, ...data } = updateElementDTO;
    if (!elementId) {
        throw new Error('updateElement: @elementId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CONTENT_ENDPOINT}/elements/${elementId}`,
        })
        .setBody({ ...data })
        .execute<ElementView>();

    return response.data;
};

export const deleteElement = async (elementId: string): Promise<ElementView> => {
    if (!elementId) {
        throw new Error('deleteElement: @elementId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'DELETE',
            baseURL: `${CONTENT_ENDPOINT}/elements/${elementId}`,
        })
        .setBody({})
        .execute<ElementView>();

    return data;
};

export const uploadImage = async (
    image: File,
    onUploadProgress?: (event: unknown) => void
): Promise<UploadedImage | null> => {
    if (!image) {
        throw new Error('@image is required');
    }
    const extraConfig = onUploadProgress ? { onUploadProgress } : {};
    const form = new FormData();
    form.append('file', image);

    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${IMAGE_API_ENDPOINT}/upload`,
        })
        .setParams({})
        .setBody(form)
        .addHeaders({
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'multipart/form-data',
        })
        .addAxiosRequestConfig(extraConfig)
        .execute();

    try {
        return data.list[0];
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const updateActivity = async (updateActivityDTO: UpdateActivityDTO): Promise<ContentView> => {
    const { contentId, ...data } = updateActivityDTO;
    if (!contentId) {
        throw new Error('updateActivity: @contentId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CONTENT_ENDPOINT}/contents/${contentId}/activity`,
        })
        .setParams({ ...data })
        .setBody({})
        .execute<ContentView>();

    return response.data;
};
