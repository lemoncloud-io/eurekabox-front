import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import type { AgentView, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import type { AgentFormData} from '@eurekabox/agents';
import { useAgent, useCreateAgent, useCreatePrompt, useUpdateAgent } from '@eurekabox/agents';
import { usePrompts } from '@eurekabox/agents';
import { toSelectOptions, viewToFormData } from '@eurekabox/agents';
import { useBrains, useEmbeddings } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Button } from '@eurekabox/ui-kit/components/ui/button';

import type { PromptState } from '../types';
import { createPromptsIfNeeded, requestCreateAgent, requestUpdateAgent } from '../utils';
import type { AgentFormAdvancedRef } from './AgentFormAdvanced';
import { AgentFormAdvanced } from './AgentFormAdvanced';
import { AgentFormBasic } from './AgentFormBasic';

interface AgentFormProps {
    mode: 'create' | 'edit';
    agentId: string | null;
    agentData?: AgentView | null;
    onFormSuccess: (agentId: string) => void;
}

export const AgentForm = ({ mode, agentData, agentId, onFormSuccess }: AgentFormProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState<AgentFormData>({});
    const [systemPromptState, setSystemPromptState] = useState<PromptState>({
        mode: 'existing',
        customContent: '',
        loadedContent: '',
    });
    const [userPromptState, setUserPromptState] = useState<PromptState>({
        mode: 'existing',
        customContent: '',
        loadedContent: '',
    });

    const advancedFormRef = useRef<AgentFormAdvancedRef>(null);

    const { data: fallbackAgent, isLoading: isLoadingAgent } = useAgent(
        agentId || '',
        mode === 'edit' && Boolean(agentId) && !agentData
    );

    const currentAgent = useMemo(() => {
        return agentData || fallbackAgent || null;
    }, [agentData, fallbackAgent]);

    const { data: embeddingsData, isLoading: isLoadingEmbeddings, error: embeddingsError } = useEmbeddings({});
    const { data: brainsData, isLoading: isLoadingBrains, error: brainsError } = useBrains({});
    const { data: promptsData, isLoading: isLoadingPrompts, error, refetch } = usePrompts({ limit: -1 });

    const createMutation = useCreateAgent();
    const updateMutation = useUpdateAgent();
    const createPromptMutation = useCreatePrompt();

    const groupedPrompts = useMemo(() => {
        if (!promptsData?.data) {
            return { system: [], user: [] };
        }

        return promptsData.data.reduce(
            (acc, prompt) => {
                if (prompt.stereo === 'system') {
                    acc.system.push(prompt);
                }
                if (prompt.stereo === 'user') {
                    acc.user.push(prompt);
                }
                return acc;
            },
            { system: [] as PromptView[], user: [] as PromptView[] }
        );
    }, [promptsData?.data]);

    const selectOptions = useMemo(
        () => ({
            embeddings: toSelectOptions.embeddings(embeddingsData?.data || []),
            brains: toSelectOptions.brains(brainsData?.data || []),
            systemPrompts: toSelectOptions.prompts(groupedPrompts?.system || []),
            userPrompts: toSelectOptions.prompts(groupedPrompts?.user || []),
        }),
        [embeddingsData, brainsData, groupedPrompts]
    );

    const getDefaultFormData = (): AgentFormData => ({
        temperature: 100,
        maxTokens: 2048,
        brainId: selectOptions.brains[0]?.value || '',
        embeddingId: selectOptions.embeddings[0]?.value || '',
        userPromptId: selectOptions.userPrompts[0]?.value || '',
    });

    useEffect(() => {
        if (mode === 'edit' && currentAgent) {
            setFormData(viewToFormData(currentAgent));
        } else if (mode === 'create' && selectOptions.brains.length > 0) {
            setFormData(getDefaultFormData());
        }
    }, [mode, currentAgent, selectOptions.brains.length]);

    const handleFormDataChange = (updates: Partial<AgentFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSystemPromptStateChange = useCallback((updates: Partial<PromptState>) => {
        setSystemPromptState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleUserPromptStateChange = useCallback((updates: Partial<PromptState>) => {
        setUserPromptState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleSave = async () => {
        try {
            // Step 1: Create any required prompts and get form updates
            const promptUpdates = await createPromptsIfNeeded(advancedFormRef, createPromptMutation, queryClient);
            // Step 2: Merge form data with prompt updates
            const finalFormData = { ...formData, ...promptUpdates };
            // Step 3: Execute the appropriate agent operation
            const result = await (mode === 'create'
                ? requestCreateAgent(finalFormData, createMutation, queryClient, t)
                : mode === 'edit' && agentId
                ? requestUpdateAgent(agentId, finalFormData, updateMutation, queryClient, t)
                : Promise.reject(new Error('Invalid operation state')));
            // Step 4: Notify success
            onFormSuccess(result.id);
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast({
                title: t('agent.form.messages.saveError'),
                variant: 'destructive',
            });
        }
    };

    const isDataLoading = isLoadingEmbeddings || isLoadingBrains || isLoadingPrompts;
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const isAgentLoading = mode === 'edit' && Boolean(agentId) && !agentData && isLoadingAgent;
    const isLoading = isSaving || isAgentLoading;

    const isFormValid = formData.nick?.trim() && formData.role?.trim() && formData.brainId && formData.embeddingId;

    const tabConfig = [
        { key: 'basic', label: t('agent.form.tabs.basic') },
        { key: 'advanced', label: t('agent.form.tabs.advanced') },
        { key: 'api', label: t('agent.form.tabs.api') },
    ];

    return (
        <div className="h-[calc(100vh-140px)] bg-white dark:bg-[#1C1C1D] shadow-[0_0_10px_rgba(0,0,0,0.06)] border border-chatbot-line rounded-[16px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 pb-[9px]">
                <div className="flex items-center gap-[27px]">
                    {tabConfig.map(({ key, label }) => (
                        <button
                            key={key}
                            className={`relative text-xs after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:-translate-x-1/2 after:w-[18px] after:h-[2px] after:rounded-full transition-colors ${
                                activeTab === key
                                    ? 'text-text-800 after:bg-text-800'
                                    : 'text-text-400 after:bg-transparent'
                            }`}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <Button
                    size="sm"
                    className="w-[52px] h-[26px] text-xs disabled:text-white"
                    onClick={handleSave}
                    disabled={isLoading || !isFormValid || isDataLoading}
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        t(mode === 'create' ? 'agent.form.actions.create' : 'agent.form.actions.save')
                    )}
                </Button>
            </div>

            {isDataLoading ? (
                <div className="flex items-center gap-2 w-full h-full justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'basic' && (
                        <AgentFormBasic
                            formData={formData}
                            onChange={handleFormDataChange}
                            isLoading={isLoading}
                            selectOptions={{
                                brains: selectOptions.brains,
                                embeddings: selectOptions.embeddings,
                            }}
                            hasEmbeddingsError={!!embeddingsError}
                            hasBrainsError={!!brainsError}
                        />
                    )}
                    {activeTab === 'advanced' && (
                        <AgentFormAdvanced
                            ref={advancedFormRef}
                            formData={formData}
                            onChange={handleFormDataChange}
                            isLoading={isLoading}
                            selectOptions={{
                                systemPrompts: selectOptions.systemPrompts,
                                userPrompts: selectOptions.userPrompts,
                            }}
                            promptsData={{
                                systemPrompts: groupedPrompts?.system || [],
                                userPrompts: groupedPrompts?.user || [],
                            }}
                            onPromptCreate={createPromptMutation.mutateAsync}
                            systemPromptState={systemPromptState}
                            userPromptState={userPromptState}
                            onSystemPromptStateChange={handleSystemPromptStateChange}
                            onUserPromptStateChange={handleUserPromptStateChange}
                        />
                    )}
                    {activeTab === 'api' && (
                        <div className="p-4 text-center text-gray-500">
                            {t('agent.form.placeholders.apiIntegration')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
