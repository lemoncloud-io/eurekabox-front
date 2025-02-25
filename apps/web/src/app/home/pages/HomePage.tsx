import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { FileText } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { useContents } from '@eurekabox/contents';
import { Button } from '@eurekabox/lib/components/ui/button';
import { Card } from '@eurekabox/lib/components/ui/card';
import { Separator } from '@eurekabox/lib/components/ui/separator';
import { Loader } from '@eurekabox/shared';

import { EditorLayout } from '../layouts/EditorLayout';

const DISPLAY_COUNT = 5;

export const HomePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [title, setTitle] = useState<string>('');
    const [displayCount, setDisplayCount] = useState(DISPLAY_COUNT);
    const { data: contentsData, isLoading } = useContents({ limit: -1, activity: true });

    const contents = useMemo(() => contentsData?.data || [], [contentsData]);
    const displayedContents = useMemo(() => {
        return contents.slice(0, displayCount);
    }, [contents, displayCount]);

    const handleContentClick = (content: ContentView) => {
        navigate(`/${content.id}`);
    };

    const handleViewMore = () => {
        setDisplayCount(prev => prev + DISPLAY_COUNT);
    };

    const handleViewLess = () => {
        setDisplayCount(DISPLAY_COUNT);
    };

    const showViewMore = !isLoading && displayCount < contents.length;
    const showViewLess = !isLoading && displayCount > DISPLAY_COUNT && displayCount >= contents.length;

    return (
        <EditorLayout isDashboard={true} title={title} isLoading={false} onTitleChange={setTitle}>
            <div className="px-20 py-6 max-md:p-6 max-md:pl-10 w-full flex justify-center max-w-screen-xl mx-auto">
                <div className="w-full">
                    <div className="text-[28px] font-semibold mb-4">{t('home.title')}</div>
                    <div className="text-text-800 mb-[10px]">{t('home.myPage')}</div>
                    <Card className="p-2 rounded-[6px]">
                        {isLoading && <Loader />}
                        {!isLoading && contents.length === 0 && (
                            <Button
                                variant="ghost"
                                className="w-full h-[29px] justify-start font-normal text-text-700 px-1"
                            >
                                <span className="flex-1 text-left truncate w-0">{t('home.noPages')}</span>
                            </Button>
                        )}
                        {!isLoading &&
                            displayedContents.map(content => (
                                <div key={content.id}>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-[29px] justify-start font-normal text-text-700 px-1"
                                        onClick={() => handleContentClick(content)}
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span className="flex-1 text-left truncate w-0">{content.title}</span>
                                    </Button>
                                    <Separator className="my-[6px]" />
                                </div>
                            ))}
                        {(showViewMore || showViewLess) && (
                            <button
                                onClick={showViewMore ? handleViewMore : handleViewLess}
                                className="underline text-text-700 mt-[10px] ml-1 hover:text-text-800"
                            >
                                {showViewMore ? t('home.viewMore') : t('home.viewLess')}
                            </button>
                        )}
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};
