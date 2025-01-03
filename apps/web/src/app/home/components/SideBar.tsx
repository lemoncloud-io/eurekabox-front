import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FileText, Plus } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { useInfiniteContents } from '@eurekabox/contents';
import { Loader } from '@eurekabox/shared';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { ScrollArea } from '@eurekabox/ui-kit/components/ui/scroll-area';

import { useCreateContentWithCache } from '../hooks';

export const SideBar = () => {
    const navigate = useNavigate();
    const { contentId } = useParams<{ contentId: string }>();
    const scrollAreaRef = useRef(null);
    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();

    const {
        data: contentsData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteContents({ limit: 50, page: 0 });

    const totalContents = useMemo(() => {
        return contentsData?.pages[0]?.total || 0;
    }, [contentsData]);

    const myContents = useMemo(() => {
        const myContents = contentsData?.pages.flatMap(page => page.list) || [];
        return [...myContents];
    }, [contentsData]);

    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea) {
            return;
        }

        const handleScroll = event => {
            const viewport = event.currentTarget;
            const scrollBottom = Math.round(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight);
            const BOTTOM_PADDING = 20;
            if (scrollBottom < BOTTOM_PADDING && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        };

        // Find the scroll-area-viewport element
        const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
        if (!viewport) {
            return;
        }
        viewport.addEventListener('scroll', handleScroll);
        return () => {
            viewport.removeEventListener('scroll', handleScroll);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleClickContent = (content: ContentView) => {
        navigate(`/home/${content.id}`);
    };

    return (
        <div className={`w-64 flex flex-col border-r border-border h-full glassmorphism`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold mb-4 gradient-text cursor-pointer" onClick={() => navigate('/home')}>
                    EurekaBox
                </h1>
                <Button
                    className="w-full justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground"
                    disabled={isCreatePending}
                    onClick={handleCreate}
                >
                    {isCreatePending ? (
                        <Loader className="text-white" message={'Creating...'} />
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            New page
                        </>
                    )}
                </Button>
            </div>
            <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                <div className="p-4 space-y-2 w-64">
                    {isLoading && <Loader />}
                    {!isLoading && myContents.length === 0 && (
                        <Button
                            variant="ghost"
                            className="w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20"
                        >
                            No Contents
                        </Button>
                    )}
                    {!isLoading && (
                        <>
                            {myContents.map((content, index) => (
                                <Button
                                    key={content.id}
                                    variant="ghost"
                                    className={`w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20
                                        ${content.id === contentId ? 'bg-primary/20' : ''}`}
                                    onClick={() => handleClickContent(content)}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span className="truncate">{content.title || 'Untitled'}</span>
                                </Button>
                            ))}
                            {isFetchingNextPage && <Loader />}
                        </>
                    )}
                </div>
            </ScrollArea>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                Total Contents: {totalContents}
            </div>
        </div>
    );
};
