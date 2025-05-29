import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

export interface MyChatView extends ChatView {
    isError?: any;
    updatedContent?: string;
    isPinned?: boolean;
}

export interface ChatState {
    myChats: MyChatView[];
    currentChat: MyChatView | null;
    messages: MyChatView[];
    pendingMessage: MyChatView | null;
    isLoading: boolean;
    isWaitingResponse: boolean;
    input: string;
}

export type HelpTab = 'faq' | 'chat';
export type PricingTab = 'billing' | 'conversation';
