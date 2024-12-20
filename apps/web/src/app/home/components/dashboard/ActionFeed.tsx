import { Avatar, AvatarFallback, AvatarImage } from '@eurekabox/ui-kit/components/ui/avatar';

const activities = [
    {
        id: '1',
        user: {
            name: '김철수',
            avatar: '/avatars/01.png',
        },
        action: '문서 편집',
        target: '마케팅 전략 2024',
        time: '방금 전',
    },
    {
        id: '2',
        user: {
            name: '이영희',
            avatar: '/avatars/02.png',
        },
        action: '댓글 작성',
        target: '제품 로드맵',
        time: '10분 전',
    },
    {
        id: '3',
        user: {
            name: '박민준',
            avatar: '/avatars/03.png',
        },
        action: '문서 생성',
        target: '2024 예산 계획',
        time: '1시간 전',
    },
    {
        id: '4',
        user: {
            name: '정수연',
            avatar: '/avatars/04.png',
        },
        action: '문서 공유',
        target: '팀 미팅 노트',
        time: '2시간 전',
    },
    {
        id: '5',
        user: {
            name: '홍길동',
            avatar: '/avatars/05.png',
        },
        action: '문서 삭제',
        target: '구 프로젝트 계획',
        time: '어제',
    },
];

export function ActivityFeed() {
    return (
        <div className="space-y-8">
            {activities.map(activity => (
                <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={activity.user.avatar} alt="Avatar" />
                        <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {activity.action} - {activity.target}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">{activity.time}</div>
                </div>
            ))}
        </div>
    );
}
