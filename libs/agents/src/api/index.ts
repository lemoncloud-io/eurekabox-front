import type { AgentView, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import type { ListResult, Params } from '@eurekabox/shared';
import { webCore } from '@eurekabox/web-core';

import type { CreateAgentDTO, CreatePromptDTO, UpdateAgentDTO, UpdatePromptDTO } from '../types';

const CHATBOTS_ENDPOINT = import.meta.env.VITE_CHATBOTS_API_ENDPOINT.toLowerCase();

export const fetchAgents = async (params: Params): Promise<ListResult<AgentView>> => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/agents`,
        })
        .setParams(params)
        .execute<ListResult<AgentView>>();

    return { ...data };
};

export const fetchAgentById = async (agentId: string): Promise<AgentView> => {
    if (!agentId) {
        throw new Error('fetchAgentById: @agentId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/agents/${agentId}`,
        })
        .execute<AgentView>();

    return { ...data };
};

export const createAgent = async (createBody: CreateAgentDTO): Promise<AgentView> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/agents/0`,
        })
        .setBody(createBody)
        .execute<AgentView>();

    return response.data;
};

export const deleteAgent = async (agentId: string): Promise<AgentView> => {
    if (!agentId) {
        throw new Error('deleteAgent: @agentId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'DELETE',
            baseURL: `${CHATBOTS_ENDPOINT}/agents/${agentId}`,
        })
        .setBody({})
        .execute<AgentView>();

    return data;
};

export const updateAgent = async (updateBody: UpdateAgentDTO): Promise<AgentView> => {
    const { agentId, ...data } = updateBody;
    if (!agentId) {
        throw new Error('updateAgent: @agentId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CHATBOTS_ENDPOINT}/agents/${agentId}`,
        })
        .setBody(data)
        .execute<AgentView>();

    return response.data;
};

export const fetchPrompts = async (params: Params): Promise<ListResult<PromptView>> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts`,
        })
        .setParams({ ...params })
        .execute<ListResult<PromptView>>();

    return response.data;
};

export const fetchPromptById = async (promptId: string): Promise<PromptView> => {
    if (!promptId) {
        throw new Error('fetchPromptById: @promptId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'GET',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts/${promptId}`,
        })
        .execute<PromptView>();

    return { ...data };
};

export const createPrompt = async (createBody: CreatePromptDTO): Promise<PromptView> => {
    const response = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts/0`,
        })
        .setBody(createBody)
        .execute<PromptView>();

    return response.data;
};

export const deletePrompt = async (promptId: string): Promise<PromptView> => {
    if (!promptId) {
        throw new Error('deletePrompt: @promptId is required');
    }

    const { data } = await webCore
        .buildSignedRequest({
            method: 'DELETE',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts/${promptId}`,
        })
        .setBody({})
        .execute<PromptView>();

    return data;
};

export const updatePrompt = async (updateBody: UpdatePromptDTO): Promise<PromptView> => {
    const { promptId, ...data } = updateBody;
    if (!promptId) {
        throw new Error('updatePrompt: @promptId is required');
    }

    const response = await webCore
        .buildSignedRequest({
            method: 'PUT',
            baseURL: `${CHATBOTS_ENDPOINT}/prompts/${promptId}`,
        })
        .setBody(data)
        .execute<PromptView>();

    return response.data;
};
