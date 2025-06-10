import React, { useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { PromptBody, PromptView } from '@lemoncloud/ssocio-chatbots-api';

import type { AgentFormData, CreatePromptDTO, SelectOption } from '@eurekabox/agents';
import { formatDate } from '@eurekabox/chatbots';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eurekabox/ui-kit/components/ui/select';
import { Textarea } from '@eurekabox/ui-kit/components/ui/textarea';

import type { PromptState } from '../types';

export interface AgentFormAdvancedRef {
    getPromptCreationData: () => {
        systemPrompt?: CreatePromptDTO;
        userPrompt?: CreatePromptDTO;
    };
}

interface AgentFormAdvancedProps {
    formData: AgentFormData;
    onChange: (updates: Partial<AgentFormData>) => void;
    isLoading?: boolean;
    selectOptions: {
        systemPrompts: SelectOption[];
        userPrompts: SelectOption[];
    };
    promptsData: {
        systemPrompts: PromptView[];
        userPrompts: PromptView[];
    };
    onPromptCreate?: (promptData: CreatePromptDTO) => Promise<PromptView>;
    systemPromptState: PromptState;
    userPromptState: PromptState;
    onSystemPromptStateChange: (updates: Partial<PromptState>) => void;
    onUserPromptStateChange: (updates: Partial<PromptState>) => void;
}

export const AgentFormAdvanced = React.memo(
    React.forwardRef<AgentFormAdvancedRef, AgentFormAdvancedProps>(
        (
            {
                formData,
                onChange,
                isLoading = false,
                selectOptions,
                promptsData,
                onPromptCreate,
                systemPromptState,
                userPromptState,
                onSystemPromptStateChange,
                onUserPromptStateChange,
            },
            ref
        ) => {
            const { t } = useTranslation();

            const contentsToString = useCallback((contents: string | string[] | undefined): string => {
                if (!contents) {
                    return '';
                }
                if (typeof contents === 'string') {
                    return contents;
                }
                if (Array.isArray(contents)) {
                    return contents.join('\n');
                }
                return '';
            }, []);

            const promptContentMap = useMemo(() => {
                const map = new Map<string, string>();

                promptsData.systemPrompts.forEach(prompt => {
                    if (prompt.id && prompt.contents) {
                        map.set(prompt.id, contentsToString(prompt.contents));
                    }
                });

                promptsData.userPrompts.forEach(prompt => {
                    if (prompt.id && prompt.contents) {
                        map.set(prompt.id, contentsToString(prompt.contents));
                    }
                });

                return map;
            }, [promptsData.systemPrompts, promptsData.userPrompts, contentsToString]);

            useImperativeHandle(
                ref,
                () => ({
                    getPromptCreationData: () => {
                        const result: { systemPrompt?: CreatePromptDTO; userPrompt?: CreatePromptDTO } = {};

                        if (systemPromptState.mode === 'create' && systemPromptState.customContent.trim()) {
                            result.systemPrompt = {
                                name: `${t('agent.form.advanced.prompts.names.customSystem')} ${formatDate(
                                    new Date().getTime(),
                                    'YYMMDD_HHmm'
                                )}`,
                                contents: systemPromptState.customContent.split('\n'),
                                stereo: 'system',
                            } as PromptBody;
                        }

                        if (userPromptState.mode === 'create' && userPromptState.customContent.trim()) {
                            result.userPrompt = {
                                name: `${t('agent.form.advanced.prompts.names.customUser')} ${formatDate(
                                    new Date().getTime(),
                                    'YYMMDD_HHmm'
                                )}`,
                                contents: userPromptState.customContent.split('\n'),
                                stereo: 'user',
                            } as PromptBody;
                        }

                        return result;
                    },
                }),
                [systemPromptState, userPromptState, t]
            );

            const enhancedSystemPrompts = useMemo(
                () => [
                    { value: '__create__', label: t('agent.form.advanced.prompts.options.directInput') },
                    ...selectOptions.systemPrompts,
                ],
                [selectOptions.systemPrompts, t]
            );

            const enhancedUserPrompts = useMemo(
                () => [
                    { value: '__create__', label: t('agent.form.advanced.prompts.options.directInput') },
                    ...selectOptions.userPrompts,
                ],
                [selectOptions.userPrompts, t]
            );

            const getPromptContent = useCallback(
                (promptId: string): string => {
                    return promptContentMap.get(promptId) || '';
                },
                [promptContentMap]
            );

            const handlePromptChange = useCallback(
                (field: 'promptId' | 'userPromptId', value: string) => {
                    const isSystem = field === 'promptId';
                    const isCreateMode = value === '__create__';

                    if (isCreateMode) {
                        if (isSystem) {
                            onSystemPromptStateChange({
                                mode: 'create',
                                loadedContent: '',
                            });
                        } else {
                            onUserPromptStateChange({
                                mode: 'create',
                                loadedContent: '',
                            });
                        }
                        onChange({ [field]: '' });
                    } else {
                        const content = getPromptContent(value);

                        if (isSystem) {
                            onSystemPromptStateChange({
                                mode: 'existing',
                                loadedContent: content,
                            });
                        } else {
                            onUserPromptStateChange({
                                mode: 'existing',
                                loadedContent: content,
                            });
                        }
                        onChange({ [field]: value });
                    }
                },
                [onChange, getPromptContent, onSystemPromptStateChange, onUserPromptStateChange]
            );

            const handleCustomTextChange = useCallback(
                (isSystem: boolean, content: string) => {
                    if (isSystem) {
                        onSystemPromptStateChange({ customContent: content });
                    } else {
                        onUserPromptStateChange({ customContent: content });
                    }
                },
                [onSystemPromptStateChange, onUserPromptStateChange]
            );

            useEffect(() => {
                if (formData.promptId && !systemPromptState.loadedContent) {
                    const content = getPromptContent(formData.promptId);
                    onSystemPromptStateChange({
                        loadedContent: content,
                        mode: 'existing',
                    });
                }
            }, [formData.promptId, getPromptContent, systemPromptState.loadedContent, onSystemPromptStateChange]);

            useEffect(() => {
                if (formData.userPromptId && !userPromptState.loadedContent) {
                    const content = getPromptContent(formData.userPromptId);
                    onUserPromptStateChange({
                        loadedContent: content,
                        mode: 'existing',
                    });
                }
            }, [formData.userPromptId, getPromptContent, userPromptState.loadedContent, onUserPromptStateChange]);

            const handleFieldChange = useCallback(
                (field: keyof AgentFormData) => (value: string | number) => {
                    onChange({ [field]: value });
                },
                [onChange]
            );

            const getTemperatureDisplayValue = (apiValue: number | undefined): number => {
                if (apiValue === undefined || apiValue === null) {
                    return 1.0;
                }
                return Math.round((apiValue / 100) * 10) / 10;
            };

            const formatTemperatureDisplay = (displayValue: number): string => {
                return displayValue === 1.0
                    ? t('agent.form.advanced.settings.temperature.maxLabel')
                    : displayValue.toFixed(1);
            };

            const formatNumber = (num: number) => num.toLocaleString();

            const renderPromptSection = (
                title: string,
                field: 'promptId' | 'userPromptId',
                options: SelectOption[],
                placeholder: string,
                promptState: PromptState,
                defaultPlaceholder: string
            ) => {
                const isSystem = field === 'promptId';
                const selectedValue = promptState.mode === 'create' ? '__create__' : formData[field] || '';
                const textareaValue =
                    promptState.mode === 'create' ? promptState.customContent : promptState.loadedContent;
                const isTextareaDisabled = promptState.mode === 'existing' || isLoading;

                return (
                    <div>
                        <label className="inline-block text-base font-medium text-text mb-[9px]">{title}</label>
                        <Select
                            value={selectedValue}
                            onValueChange={value => handlePromptChange(field, value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="h-[37px] border-chatbot-line mb-2">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {promptState.mode === 'create' && (
                            <div className="text-[#007AFF] mb-2 pl-[6px]">
                                {t('agent.form.advanced.prompts.descriptions.directInputMode')}
                            </div>
                        )}

                        {promptState.mode === 'existing' && (
                            <div className="text-[#9FA2A7] mb-2 pl-[6px]">
                                {t('agent.form.advanced.prompts.descriptions.existingMode')}
                            </div>
                        )}

                        <Textarea
                            className={`${isSystem ? 'h-[300px]' : 'h-[125px]'} resize-none`}
                            placeholder={
                                promptState.mode === 'create'
                                    ? defaultPlaceholder
                                    : t('agent.form.advanced.prompts.placeholders.emptyPrompt')
                            }
                            value={textareaValue}
                            onChange={e => {
                                if (promptState.mode === 'create') {
                                    handleCustomTextChange(isSystem, e.target.value);
                                }
                            }}
                            disabled={isTextareaDisabled}
                        />

                        {!isSystem && (
                            <div className="text-[#007AFF] font-medium mt-[6px] text-sm pl-[6px]">
                                {t('agent.form.advanced.prompts.descriptions.userPromptNote')}
                            </div>
                        )}
                    </div>
                );
            };

            return (
                <div className="space-y-[38px] h-full overflow-auto p-4">
                    {renderPromptSection(
                        t('agent.form.advanced.prompts.systemPrompt'),
                        'promptId',
                        enhancedSystemPrompts,
                        t('agent.form.advanced.prompts.placeholders.selectSystemPrompt'),
                        systemPromptState,
                        t('agent.form.advanced.prompts.placeholders.systemPromptDefault')
                    )}

                    {renderPromptSection(
                        t('agent.form.advanced.prompts.userPrompt'),
                        'userPromptId',
                        enhancedUserPrompts,
                        t('agent.form.advanced.prompts.placeholders.selectUserPrompt'),
                        userPromptState,
                        t('agent.form.advanced.prompts.placeholders.userPromptDefault')
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="inline-block text-base font-medium text-text mb-[5px]">
                                {t('agent.form.advanced.settings.temperature.label')}
                            </label>
                            <div className="text-sm text-[#9FA2A7] mb-4 whitespace-pre-line">
                                {t('agent.form.advanced.settings.temperature.description')}
                            </div>
                            <div className="w-full px-[6px]">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={formData.temperature ?? 100}
                                        onChange={e => {
                                            const apiValue = Number(e.target.value);
                                            handleFieldChange('temperature')(apiValue);
                                        }}
                                        disabled={isLoading}
                                        className="w-full h-1 appearance-none rounded-full outline-none slider-thumb"
                                        style={{
                                            background: `linear-gradient(
                        to right,
                        hsl(var(--point)) 0%,
                        hsl(var(--point)) ${((formData.temperature ?? 100) / 100) * 100}%,
                        hsl(var(--text-400)) ${((formData.temperature ?? 100) / 100) * 100}%,
                        hsl(var(--text-400)) 100%
                    )`,
                                        }}
                                    />
                                    <div
                                        className="absolute -bottom-6 text-sm font-medium text-point transform whitespace-nowrap"
                                        style={{
                                            left: `${((formData.temperature ?? 100) / 100) * 100}%`,
                                            transform:
                                                (formData.temperature ?? 100) === 100
                                                    ? 'translateX(-100%)'
                                                    : 'translateX(-50%)',
                                        }}
                                    >
                                        {formatTemperatureDisplay(getTemperatureDisplayValue(formData.temperature))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="inline-block text-base font-medium text-text mb-[5px]">
                                {t('agent.form.advanced.settings.maxTokens.label')}
                            </label>
                            <div className="text-sm text-[#9FA2A7] dark:text-[#9FA2A7] mb-4 whitespace-pre-line">
                                {t('agent.form.advanced.settings.maxTokens.description')}
                            </div>
                            <div className="w-full px-[6px]">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min={0}
                                        max={4096}
                                        step={1}
                                        value={formData.maxTokens ?? 2048}
                                        onChange={e => handleFieldChange('maxTokens')(Number(e.target.value))}
                                        disabled={isLoading}
                                        className="w-full h-1 appearance-none rounded-full outline-none slider-thumb"
                                        style={{
                                            background: `linear-gradient(
                        to right,
                        hsl(var(--point)) 0%,
                        hsl(var(--point)) ${((formData.maxTokens ?? 0) / 4096) * 100}%,
                        hsl(var(--text-400)) ${((formData.maxTokens ?? 0) / 4096) * 100}%,
                        hsl(var(--text-400)) 100%
                    )`,
                                        }}
                                    />
                                    <div
                                        className="absolute -bottom-6 text-sm font-medium text-point transform whitespace-nowrap"
                                        style={{
                                            left: `${((formData.maxTokens ?? 0) / 4096) * 100}%`,
                                            transform:
                                                (formData.maxTokens ?? 0) === 4096
                                                    ? 'translateX(-100%)'
                                                    : 'translateX(-50%)',
                                        }}
                                    >
                                        {(formData.maxTokens ?? 0) === 4096
                                            ? `${t('agent.form.advanced.settings.maxTokens.maxLabel')} `
                                            : ''}
                                        {formatNumber(formData.maxTokens ?? 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    )
);

AgentFormAdvanced.displayName = 'AgentFormAdvanced';
