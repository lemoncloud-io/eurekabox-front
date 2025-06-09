import type {
    AgentBody,
    AgentView,
    BrainView,
    EmbeddingView,
    PromptBody,
    PromptView,
} from '@lemoncloud/ssocio-chatbots-api';

export type CreateAgentDTO = AgentBody;

export type UpdateAgentDTO = {
    agentId: string;
} & Partial<AgentBody>;

export type CreatePromptDTO = PromptBody;

export type UpdatePromptDTO = {
    promptId: string;
} & Partial<PromptBody>;

export interface SelectOption {
    value: string;
    label: string;
}

export const toSelectOptions = {
    embeddings: (embeddings: EmbeddingView[]): SelectOption[] =>
        embeddings?.map(item => ({
            value: item.id || '',
            label: item.name || item.id || '이름 없음',
        })) || [],

    brains: (brains: BrainView[]): SelectOption[] =>
        brains?.map(item => ({
            value: item.id || '',
            label: item.name || item.id || '이름 없음',
        })) || [],

    prompts: (prompts: PromptView[]): SelectOption[] =>
        prompts?.map(item => ({
            value: item.id || '',
            label: item.name || item.id || '이름 없음',
        })) || [],
};

export interface AgentFormData {
    // 기본 모델 정보
    name?: string;
    brainId?: string;
    embeddingId?: string;

    // 고급 설정
    promptId?: string;
    userPromptId?: string;
    temperature?: number; // 0~100
    maxTokens?: number; // 0~4096

    // 메타데이터 (평면화된 형태로 관리)
    nick?: string;
    age?: string;
    role?: string;
    goal?: string;
    mind?: string;
    like?: string;
    tone?: string;
    greet?: string;
    intro?: string;
    back?: string;
    abuse?: string;
    thank?: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export const viewToFormData = (agent: AgentView): AgentFormData => ({
    name: agent.name,
    brainId: agent.brainId,
    embeddingId: agent.embeddingId,
    promptId: agent.promptId,
    userPromptId: agent.userPromptId,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,

    // meta$ 평면화
    nick: agent.meta$?.nick,
    age: agent.meta$?.age,
    role: agent.meta$?.role,
    goal: agent.meta$?.goal,
    mind: agent.meta$?.mind,
    like: agent.meta$?.like,
    tone: agent.meta$?.tone,
    greet: agent.meta$?.greet,
    intro: agent.meta$?.intro,
    back: agent.meta$?.back,
    abuse: agent.meta$?.abuse,
    thank: agent.meta$?.thank,
});

export const formDataToCreateDTO = (formData: AgentFormData): CreateAgentDTO =>
    ({
        name: formData.name,
        brainId: formData.brainId,
        embeddingId: formData.embeddingId,
        promptId: formData.promptId,
        userPromptId: formData.userPromptId,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,

        meta$: {
            nick: formData.nick,
            age: formData.age,
            role: formData.role,
            goal: formData.goal,
            mind: formData.mind,
            like: formData.like,
            tone: formData.tone,
            greet: formData.greet,
            intro: formData.intro,
            back: formData.back,
            abuse: formData.abuse,
            thank: formData.thank,
        },
    } as AgentBody);

export const formDataToUpdateDTO = (agentId: string, formData: AgentFormData): UpdateAgentDTO => ({
    agentId,
    ...formDataToCreateDTO(formData),
});
