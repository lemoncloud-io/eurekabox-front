import type { Conversation, ModelInfo, RelatedDocument } from '../types';

export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const DUMMY_RELATED_DOCUMENTS: RelatedDocument[] = [
    { id: '1', title: '사용자 매뉴얼 가이드', url: '/docs/manual' },
    { id: '2', title: '자주 묻는 질문 FAQ', url: '/docs/faq' },
    { id: '3', title: '기술 지원 문서', url: '/docs/support' },
];

export const DUMMY_MODELS: ModelInfo[] = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'AI 에이전트 모델 간략 설명 들어가는 곳',
        pricing: { input: 0.15, cachedInput: 0.075, output: 0.6 },
        isActive: false,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o-mini',
        description: 'AI 에이전트 모델 간략 설명 들어가는 곳',
        pricing: { input: 0.075, cachedInput: 0.0375, output: 0.3 },
        isActive: true,
    },
];

export const AI_RESPONSES = [
    {
        keywords: ['안녕', '안녕하세요', '처음', '시작'],
        responses: [
            '안녕하세요! 저는 Got-4o-mini AI 어시스턴트입니다. 무엇을 도와드릴까요?',
            '반갑습니다! 궁금한 것이 있으시면 언제든 말씀해 주세요.',
        ],
    },
    {
        keywords: ['도움', '도와', '질문', '문의'],
        responses: [
            '물론입니다! 구체적으로 어떤 부분에 대해 도움이 필요하신가요?',
            '기꺼이 도와드리겠습니다. 자세한 내용을 알려주시면 더 정확한 답변을 드릴 수 있어요.',
        ],
    },
    {
        keywords: ['프로그래밍', '코드', '개발', '코딩'],
        responses: [
            '프로그래밍 관련 질문이군요! 어떤 언어나 기술에 대해 궁금하신가요?',
            '개발과 관련된 도움을 드릴 수 있습니다. 구체적인 문제나 기술을 알려주세요.',
        ],
    },
    {
        keywords: ['기능', '사용법', '방법'],
        responses: [
            '해당 기능에 대한 상세한 가이드를 확인해보시는 것이 좋겠습니다. 관련 문서를 참조해보세요.',
            '사용 방법에 대해 단계별로 설명드릴 수 있습니다. 어떤 기능에 대해 궁금하신가요?',
        ],
    },
];

export const DEFAULT_RESPONSE = [
    '흥미로운 질문이네요. 좀 더 구체적으로 설명해주시면 더 도움이 될 것 같습니다.',
    '이에 대해 자세히 알아보겠습니다. 추가로 궁금한 점이 있으시면 언제든 말씀해주세요.',
    '좋은 질문입니다! 이와 관련된 정보를 찾아보고 있습니다.',
];

export const createDummyConversations = (): Conversation[] => [
    {
        id: 'conv-1',
        title: 'React 컴포넌트 최적화 방법에 대해 알려주세요',
        messages: [
            {
                id: 'msg-1',
                content: 'React 컴포넌트 최적화 방법에 대해 알려주세요',
                role: 'user',
                timestamp: new Date('2024-01-15T10:30:00'),
            },
            {
                id: 'msg-2',
                content:
                    'React 컴포넌트 최적화에는 여러 방법이 있습니다. React.memo, useMemo, useCallback 등을 활용하는 것이 대표적입니다.',
                role: 'assistant',
                timestamp: new Date('2024-01-15T10:30:05'),
                relatedDocuments: DUMMY_RELATED_DOCUMENTS.slice(0, 2),
            },
        ],
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T10:32:00'),
        isPinned: true,
    },
    {
        id: 'conv-2',
        title: 'TypeScript 타입 가드 사용법',
        messages: [
            {
                id: 'msg-3',
                content: 'TypeScript 타입 가드는 어떻게 사용하나요?',
                role: 'user',
                timestamp: new Date('2024-01-14T14:20:00'),
            },
            {
                id: 'msg-4',
                content:
                    'TypeScript 타입 가드는 런타임에서 타입을 좁혀주는 기능입니다. typeof, instanceof, in 연산자나 사용자 정의 타입 가드를 사용할 수 있습니다.',
                role: 'assistant',
                timestamp: new Date('2024-01-14T14:20:03'),
                relatedDocuments: DUMMY_RELATED_DOCUMENTS.slice(1, 3),
            },
        ],
        createdAt: new Date('2024-01-14T14:20:00'),
        updatedAt: new Date('2024-01-14T14:22:00'),
        isPinned: false,
    },
];
