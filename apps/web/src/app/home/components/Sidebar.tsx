import { Button } from '@lemonote/ui-kit/components/ui/button';
import { FileText, Loader2, Plus } from 'lucide-react';
import { ScrollArea } from '@lemonote/ui-kit/components/ui/scroll-area';
import { contentsKeys, CreateContentDTO, useCreateContent, useInfiniteContents } from '@lemonote/contents';
import { useEffect, useMemo, useRef } from 'react';
import { Loader } from '@lemonote/shared';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@lemonote/ui-kit/hooks/use-toast';
import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

export const SideBar = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const scrollAreaRef = useRef(null);

    const createContent = useCreateContent();

    const {
        data: contentsData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteContents({ limit: 10, page: 0 });

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

    const handleClickCreate = async () => {
        const newContent: CreateContentDTO = {
            name: '',
            title: '',
            subject: '',
        };
        await createContent.mutateAsync(newContent, {
            onSuccess: response => {
                navigate(`/home/${response.id}`);
            },
            onError: error => {
                toast({ description: `에러가 발생했습니다. ${error.toString()}`, variant: 'destructive' });
            },
        });
    };

    return (
        <div className={`w-64 flex flex-col h-full glassmorphism`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold mb-4 gradient-text">EurekaBox</h1>
                <Button
                    className="w-full justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground"
                    disabled={createContent.isPending}
                    onClick={handleClickCreate}
                >
                    {createContent.isPending ? (
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
                <div className="p-4 space-y-2">
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
                                    className="w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20"
                                    onClick={() => handleClickContent(content)}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {content.name || 'Untitled'}
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
