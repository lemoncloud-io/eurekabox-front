import type { QueryClient } from '@tanstack/react-query';

import type { AgentView } from '@lemoncloud/ssocio-chatbots-api';


import type { AgentFormData} from '@eurekabox/agents';
import { agentsKeys } from '@eurekabox/agents';
import { formDataToCreateDTO, formDataToUpdateDTO } from '@eurekabox/agents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { updateAllListCaches } from '@eurekabox/shared';

import type { AgentFormAdvancedRef } from '../components';

export const updateCacheWithNewAgent = (queryClient: QueryClient, resource: string, newAgent: AgentView) => {
    updateAllListCaches({ resource, queryClient }, (oldData: any) => {
        if (!oldData?.data) {
            return oldData;
        }

        return {
            ...oldData,
            data: [newAgent, ...oldData.data],
            list: [newAgent, ...oldData.list],
            total: (oldData.total || 0) + 1,
        };
    });
};

export const updateCacheWithUpdatedAgent = (
    queryClient: QueryClient,
    resource: string,
    updatedAgent: AgentView,
    agentId: string
) => {
    updateAllListCaches({ resource, queryClient, shouldInvalidate: false }, (oldData: any) => {
        if (!oldData?.data) {
            return oldData;
        }

        const updateAgent = (origin: AgentView) => (origin.id === agentId ? updatedAgent : origin);
        return {
            ...oldData,
            data: oldData.data.map(updateAgent),
            list: oldData.list.map(updateAgent),
        };
    });
};

export const createPromptsIfNeeded = async (
    advancedFormRef: React.RefObject<AgentFormAdvancedRef>,
    createPromptMutation: any,
    queryClient: QueryClient
): Promise<{ promptId?: string; userPromptId?: string }> => {
    if (!advancedFormRef.current) {
        return {};
    }

    const promptCreationData = advancedFormRef.current.getPromptCreationData();
    const updates: { promptId?: string; userPromptId?: string } = {};

    // Create system prompt if needed
    if (promptCreationData.systemPrompt) {
        const createdSystemPrompt = await createPromptMutation.mutateAsync(promptCreationData.systemPrompt);
        updates.promptId = createdSystemPrompt.id;
        updateCacheWithNewAgent(queryClient, 'prompts', createdSystemPrompt);
    }

    // Create user prompt if needed
    if (promptCreationData.userPrompt) {
        const createdUserPrompt = await createPromptMutation.mutateAsync(promptCreationData.userPrompt);
        updates.userPromptId = createdUserPrompt.id;
        updateCacheWithNewAgent(queryClient, 'prompts', createdUserPrompt);
    }

    return updates;
};

export const requestCreateAgent = async (
    formData: AgentFormData,
    createMutation: any,
    queryClient: QueryClient,
    t: any
): Promise<AgentView> => {
    const dto = formDataToCreateDTO(formData);
    const createdAgent = await createMutation.mutateAsync(dto);

    toast({
        title: t('agent.form.messages.createSuccess'),
    });

    updateCacheWithNewAgent(queryClient, 'agents', createdAgent);
    return createdAgent;
};

export const requestUpdateAgent = async (
    agentId: string,
    formData: AgentFormData,
    updateMutation: any,
    queryClient: any,
    t: any
): Promise<AgentView> => {
    const dto = formDataToUpdateDTO(agentId, formData);
    const updatedAgent = await updateMutation.mutateAsync(dto);

    toast({
        title: t('agent.form.messages.updateSuccess'),
    });

    queryClient.setQueryData(agentsKeys.detail(updatedAgent.id), updatedAgent);
    updateCacheWithUpdatedAgent(queryClient, 'agents', updatedAgent, agentId);
    return updatedAgent;
};
