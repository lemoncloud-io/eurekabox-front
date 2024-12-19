import { Avatar, AvatarFallback, AvatarImage } from '@eurekabox/ui-kit/components/ui/avatar';

const recentDocuments = [
    {
        id: '1',
        name: '마케팅 전략 2024',
        lastEdited: '2시간 전',
        author: {
            name: '김철수',
            avatar: '/avatars/01.png',
        },
    },
    {
        id: '2',
        name: '제품 로드맵',
        lastEdited: '3시간 전',
        author: {
            name: '이영희',
            avatar: '/avatars/02.png',
        },
    },
    {
        id: '3',
        name: '분기별 재무 보고서',
        lastEdited: '5시간 전',
        author: {
            name: '박민준',
            avatar: '/avatars/03.png',
        },
    },
    {
        id: '4',
        name: '팀 미팅 노트',
        lastEdited: '어제',
        author: {
            name: '정수연',
            avatar: '/avatars/04.png',
        },
    },
    {
        id: '5',
        name: '고객 피드백 요약',
        lastEdited: '2일 전',
        author: {
            name: '홍길동',
            avatar: '/avatars/05.png',
        },
    },
];

export function RecentDocuments() {
    return (
        <div className="space-y-8">
            {recentDocuments.map(document => (
                <div key={document.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={document.author.avatar} alt="Avatar" />
                        <AvatarFallback>{document.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{document.name}</p>
                        <p className="text-sm text-muted-foreground">{document.author.name}</p>
                    </div>
                    <div className="ml-auto font-medium">{document.lastEdited}</div>
                </div>
            ))}
        </div>
    );
}
