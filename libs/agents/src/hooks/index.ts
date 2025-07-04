import { useQuery } from '@tanstack/react-query';

import type { AgentView, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import { toast } from '@eurekabox/lib/hooks/use-toast';
import { createQueryKeys, useCustomMutation } from '@eurekabox/shared';
import type { PaginationType, Params } from '@eurekabox/shared';

import {
    createAgent,
    createPrompt,
    deleteAgent,
    deletePrompt,
    fetchAgentById,
    fetchAgents,
    fetchPromptById,
    fetchPrompts,
    updateAgent,
    updatePrompt,
} from '../api';
import type { CreateAgentDTO, CreatePromptDTO, UpdateAgentDTO, UpdatePromptDTO } from '../types';


export const promptKeys = createQueryKeys('prompts');
export const agentsKeys = createQueryKeys('agents');

export const useAgents = (params: Params) =>
    useQuery<PaginationType<AgentView[]>>({
        queryKey: agentsKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchAgents(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<
                AgentView[]
            >;
        },
        refetchOnWindowFocus: false,
    });

export const useAgent = (agentId: string, enabled: boolean) =>
    useQuery<AgentView>({
        queryKey: agentsKeys.detail(agentId),
        queryFn: async () => {
            const result = await fetchAgentById(agentId);
            return result;
        },
        refetchOnWindowFocus: false,
        enabled,
    });

export const useCreateAgent = () => {
    return useCustomMutation((data: CreateAgentDTO) => createAgent(data), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useDeleteAgent = () => {
    return useCustomMutation((id: string) => deleteAgent(id), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useUpdateAgent = () => {
    return useCustomMutation((dto: UpdateAgentDTO) => updateAgent(dto), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const usePrompts = (params: Params) =>
    useQuery<PaginationType<PromptView[]>>({
        queryKey: promptKeys.list(params ?? {}),
        queryFn: async () => {
            const result = await fetchPrompts(params);
            return { ...result, data: result.list.filter(data => !data.deletedAt) || [] } as PaginationType<
                PromptView[]
            >;
        },
        refetchOnWindowFocus: false,
    });

export const usePrompt = (promptId: string) =>
    useQuery<PromptView>({
        queryKey: promptKeys.detail(promptId),
        queryFn: async () => {
            const result = await fetchPromptById(promptId);
            return result;
        },
        refetchOnWindowFocus: false,
        enabled: !!promptId,
    });

export const useCreatePrompt = () => {
    return useCustomMutation((data: CreatePromptDTO) => createPrompt(data), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useDeletePrompt = () => {
    return useCustomMutation((id: string) => deletePrompt(id), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};

export const useUpdatePrompt = () => {
    return useCustomMutation((dto: UpdatePromptDTO) => updatePrompt(dto), {
        onError: error => {
            toast({ title: error instanceof Error ? error.message : 'An unknown error occurred' });
        },
    });
};
