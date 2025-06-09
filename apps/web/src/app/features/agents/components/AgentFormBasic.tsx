import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { AgentFormData, SelectOption } from '@eurekabox/agents';
import { Input } from '@eurekabox/ui-kit/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eurekabox/ui-kit/components/ui/select';
import { Textarea } from '@eurekabox/ui-kit/components/ui/textarea';


interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    required?: boolean;
}

const FormField = React.memo<FormFieldProps>(({ label, children, required = false }) => {
    const { t } = useTranslation();

    return (
        <div>
            <label className="inline-block text-base font-medium text-text mb-[9px]">
                {label}
                {required && <span className="text-red-500 ml-1">{t('agent.form.basic.states.required')}</span>}
            </label>
            {children}
        </div>
    );
});

interface AgentFormBasicProps {
    formData: AgentFormData;
    onChange: (updates: Partial<AgentFormData>) => void;
    isLoading?: boolean;
    selectOptions: {
        brains: SelectOption[];
        embeddings: SelectOption[];
    };
    hasEmbeddingsError?: boolean;
    hasBrainsError?: boolean;
}

export const AgentFormBasic = React.memo<AgentFormBasicProps>(
    ({ formData, onChange, isLoading = false, selectOptions, hasEmbeddingsError, hasBrainsError }) => {
        const { t } = useTranslation();

        const handleFieldChange = useCallback(
            (field: keyof AgentFormData) => (value: string) => {
                onChange({ [field]: value });
            },
            [onChange]
        );

        const handleNickChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange({ nick: e.target.value });
            },
            [onChange]
        );

        const handleAgeChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange({ age: e.target.value });
            },
            [onChange]
        );

        const handleRoleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ role: e.target.value });
            },
            [onChange]
        );

        const handleGoalChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ goal: e.target.value });
            },
            [onChange]
        );

        const handleMindChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ mind: e.target.value });
            },
            [onChange]
        );

        const handleLikeChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ like: e.target.value });
            },
            [onChange]
        );

        const handleToneChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ tone: e.target.value });
            },
            [onChange]
        );

        const handleGreetChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ greet: e.target.value });
            },
            [onChange]
        );

        const handleIntroChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ intro: e.target.value });
            },
            [onChange]
        );

        const handleBackChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ back: e.target.value });
            },
            [onChange]
        );

        const handleAbuseChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ abuse: e.target.value });
            },
            [onChange]
        );

        const handleThankChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ thank: e.target.value });
            },
            [onChange]
        );

        const handleBrainChange = useCallback(
            (value: string) => {
                onChange({ brainId: value });
            },
            [onChange]
        );

        const handleEmbeddingChange = useCallback(
            (value: string) => {
                onChange({ embeddingId: value });
            },
            [onChange]
        );

        return (
            <div className="flex-1 grid grid-cols-2 max-xs:grid-cols-1 gap-x-4 gap-y-5 h-full overflow-auto p-4">
                <FormField label={t('agent.form.basic.fields.model')} required>
                    <Select
                        value={formData.brainId || ''}
                        onValueChange={handleBrainChange}
                        disabled={isLoading || selectOptions.brains.length === 0 || hasBrainsError}
                    >
                        <SelectTrigger className="h-[37px] border-chatbot-line">
                            <SelectValue
                                placeholder={
                                    hasBrainsError
                                        ? t('agent.form.basic.states.loadError')
                                        : selectOptions.brains.length === 0
                                        ? t('agent.form.basic.states.loading')
                                        : t('agent.form.basic.placeholders.model')
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {hasBrainsError ? (
                                <SelectItem value="__error__" disabled>
                                    {t('agent.form.basic.states.loadError', 'Load Error')}
                                </SelectItem>
                            ) : selectOptions.brains.length === 0 ? (
                                <SelectItem value="" disabled>
                                    {t('agent.form.basic.states.noData')}
                                </SelectItem>
                            ) : (
                                selectOptions.brains.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField label={t('agent.form.basic.fields.embedding')} required>
                    <Select
                        value={formData.embeddingId || ''}
                        onValueChange={handleEmbeddingChange}
                        disabled={isLoading || selectOptions.embeddings.length === 0 || hasEmbeddingsError}
                    >
                        <SelectTrigger className="h-[37px] border-chatbot-line">
                            <SelectValue
                                placeholder={
                                    hasEmbeddingsError
                                        ? t('agent.form.basic.states.loadError')
                                        : selectOptions.embeddings.length === 0
                                        ? t('agent.form.basic.states.loading')
                                        : t('agent.form.basic.placeholders.embedding')
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {hasEmbeddingsError ? (
                                <SelectItem value="__error__" disabled>
                                    {t('agent.form.basic.states.loadError', 'Load Error')}
                                </SelectItem>
                            ) : selectOptions.embeddings.length === 0 ? (
                                <SelectItem value="" disabled>
                                    {t('agent.form.basic.states.noData')}
                                </SelectItem>
                            ) : (
                                selectOptions.embeddings.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField label={t('agent.form.basic.fields.name')} required>
                    <Input
                        placeholder={t('agent.form.basic.placeholders.name')}
                        className="h-[37px] border-chatbot-line"
                        value={formData.nick || ''}
                        onChange={handleNickChange}
                        disabled={isLoading}
                        maxLength={50}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.age')}>
                    <Input
                        placeholder={t('agent.form.basic.placeholders.age')}
                        className="h-[37px] border-chatbot-line"
                        value={formData.age || ''}
                        onChange={handleAgeChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.role')} required>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.role')}
                        className="h-[106px] resize-none"
                        value={formData.role || ''}
                        onChange={handleRoleChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.goal')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.goal')}
                        className="h-[106px] resize-none"
                        value={formData.goal || ''}
                        onChange={handleGoalChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.personality')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.personality')}
                        className="h-[106px] resize-none"
                        value={formData.mind || ''}
                        onChange={handleMindChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.hobbies')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.hobbies')}
                        className="h-[106px] resize-none"
                        value={formData.like || ''}
                        onChange={handleLikeChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.tone')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.tone')}
                        className="h-[106px] resize-none"
                        value={formData.tone || ''}
                        onChange={handleToneChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.greeting')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.greeting')}
                        className="h-[106px] resize-none"
                        value={formData.greet || ''}
                        onChange={handleGreetChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.introduction')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.introduction')}
                        className="h-[106px] resize-none"
                        value={formData.intro || ''}
                        onChange={handleIntroChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.fallback')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.fallback')}
                        className="h-[106px] resize-none"
                        value={formData.back || ''}
                        onChange={handleBackChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.abuse')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.abuse')}
                        className="h-[106px] resize-none"
                        value={formData.abuse || ''}
                        onChange={handleAbuseChange}
                        disabled={isLoading}
                    />
                </FormField>

                <FormField label={t('agent.form.basic.fields.thanks')}>
                    <Textarea
                        placeholder={t('agent.form.basic.placeholders.thanks')}
                        className="h-[106px] resize-none"
                        value={formData.thank || ''}
                        onChange={handleThankChange}
                        disabled={isLoading}
                    />
                </FormField>
            </div>
        );
    }
);
