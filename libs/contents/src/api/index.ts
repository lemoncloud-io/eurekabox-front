import { ListResult } from '@lemonote/shared';
import { ContentBody, ContentView, ElementBody, ElementView } from '@lemoncloud/lemon-contents-api';
import { Params } from '@lemoncloud/lemon-web-core';
import { AxiosRequestConfig, GenericAbortSignal } from 'axios';

import { webCore } from '@lemonote/web-core';
import { UpdateContentDTO, UpdateElementDTO } from '../types';

const CONTENT_ENDPOINT = import.meta.env.VITE_CONTENT_ENDPOINT.toLowerCase();

export const fetchContents = async (params: Params): Promise<ListResult<ContentView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CONTENT_ENDPOINT}/contents`,
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
