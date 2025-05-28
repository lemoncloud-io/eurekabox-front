import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    attachments?: Attachment[];
    relatedDocuments?: RelatedDocument[];
}

export interface Attachment {
    id: string;
    url: string;
    type: 'image' | 'file';
    name: string;
}

export interface RelatedDocument {
    id: string;
    title: string;
    url: string;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

export interface ModelInfo {
    id: string;
    name: string;
    description: string;
    pricing: {
        input: number;
        cachedInput: number;
        output: number;
    };
    isActive: boolean;
}

export interface ChatState {
    myChats: ChatView[];
    currentChat: ChatView | null;
    messages: ChatView[];
    isLoading: boolean;
    input: string;
}

export type HelpTab = 'faq' | 'chat';
export type PricingTab = 'billing' | 'conversation';
