import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

export interface ChatState {
    myChats: ChatView[];
    currentChat: ChatView | null;
    messages: ChatView[];
    pendingMessage: ChatView | null;
    isLoading: boolean;
    isWaitingResponse: boolean;
    input: string;
}

export type HelpTab = 'faq' | 'chat';
export type PricingTab = 'billing' | 'conversation';
