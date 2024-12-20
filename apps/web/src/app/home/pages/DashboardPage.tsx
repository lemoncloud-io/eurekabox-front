import { EditorLayout } from '../layouts/EditorLayout';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eurekabox/ui-kit/components/ui/card';
import { ActivityFeed, Overview, RecentDocuments, UserStats } from '../components/dashboard';

export const DashboardPage = () => {
    const [title, setTitle] = useState<string>('TODO: Create Dashboard');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle} isDashboard={true}>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 문서</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">128</div>
                            <p className="text-xs text-muted-foreground">+10% 지난 달 대비</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">573</div>
                            <p className="text-xs text-muted-foreground">+20% 지난 주 대비</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 편집 시간</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2,451 시간</div>
                            <p className="text-xs text-muted-foreground">+5% 지난 달 대비</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">평균 문서 길이</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,234 단어</div>
                            <p className="text-xs text-muted-foreground">+12% 지난 달 대비</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>개요</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>최근 문서</CardTitle>
                            <CardDescription>최근에 편집한 5개의 문서입니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentDocuments />
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>사용자 통계</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <UserStats />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>활동 피드</CardTitle>
                            <CardDescription>최근 사용자 활동 내역입니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivityFeed />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};
