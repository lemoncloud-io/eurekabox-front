import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FileText, Plus } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { useContents } from '@eurekabox/contents';
import { Loader } from '@eurekabox/shared';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { ScrollArea } from '@eurekabox/ui-kit/components/ui/scroll-area';

import { useCreateContentWithCache } from '../hooks';

type SideBarProps = {
    setSidebarOpen: (open: boolean) => void;
};

const SideBarHeader = ({
    onClose,
    onCreateContent,
    isCreating,
}: {
    onClose: () => void;
    onCreateContent: () => void;
    isCreating: boolean;
}) => {
    const navigate = useNavigate();

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold gradient-text cursor-pointer" onClick={() => navigate('/home')}>
                    EurekaBox
                </h1>
                <button
                    className="text-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
                    onClick={onClose}
                    aria-label="Close Sidebar"
                >
                    ✕
                </button>
            </div>
            <Button
                className="w-full justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground"
                disabled={isCreating}
                onClick={onCreateContent}
            >
                {isCreating ? (
                    <Loader className="text-white" message={'Creating...'} />
                ) : (
                    <>
                        <Plus className="mr-2 h-4 w-4" />
                        New page
                    </>
                )}
            </Button>
        </div>
    );
};

const ContentList = ({
    contents,
    currentContentId,
    onContentClick,
}: {
    contents: ContentView[];
    currentContentId?: string;
    onContentClick: (content: ContentView) => void;
}) => (
    <>
        {contents.map(content => (
            <Button
                key={content.id}
                variant="ghost"
                className={`w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20
                    ${content.id === currentContentId ? 'bg-primary/20' : ''}`}
                onClick={() => onContentClick(content)}
            >
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate">{content.title || 'Untitled'}</span>
            </Button>
        ))}
    </>
);

export const SideBar = ({ setSidebarOpen }: SideBarProps) => {
    const navigate = useNavigate();
    const { contentId } = useParams<{ contentId: string }>();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { data: contentsData, isLoading } = useContents({ limit: -1 });

    const totalContents = useMemo(() => contentsData?.total || 0, [contentsData]);
    const contents = useMemo(() => contentsData?.data || [], [contentsData]);

    const handleContentClick = (content: ContentView) => {
        navigate(`/home/${content.id}`);
    };

    return (
        <div className="w-[296px] flex flex-col h-full glassmorphism">
            <SideBarHeader
                onClose={() => setSidebarOpen(false)}
                onCreateContent={handleCreate}
                isCreating={isCreatePending}
            />
            <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                <div className="p-4 space-y-2 w-[296px]">
                    {isLoading && <Loader />}
                    {!isLoading && contents.length === 0 && (
                        <Button
                            variant="ghost"
                            className="w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20"
                        >
                            No Contents
                        </Button>
                    )}
                    {!isLoading && (
                        <ContentList
                            contents={contents}
                            currentContentId={contentId}
                            onContentClick={handleContentClick}
                        />
                    )}
                </div>
            </ScrollArea>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                Total Contents: {totalContents}
            </div>
        </div>
    );
};
