import { useTranslation } from 'react-i18next';

import type { ChatStrategy } from '@lemoncloud/ssocio-chatbots-api';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eurekabox/ui-kit/components/ui/select';

interface ChatbotSettingsProps {
    selectedStrategy: ChatStrategy;
    setSelectedStrategy: (value: ChatStrategy) => void;
}

export const ChatbotSettings = ({ selectedStrategy, setSelectedStrategy }: ChatbotSettingsProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm mr-2">{t('ai.chatbot.strategy')}</span>
            <Select value={selectedStrategy} onValueChange={(value: ChatStrategy) => setSelectedStrategy(value)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder={t('ai.chatbot.strategy_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="md1">md1</SelectItem>
                    <SelectItem value="md2">md2</SelectItem>
                    <SelectItem value="md3">md3</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
