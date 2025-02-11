import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ChevronsLeft, FileText, Home, Plus, Search, SquarePen } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { Logo } from '@eurekabox/assets';
import { useContents } from '@eurekabox/contents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Loader } from '@eurekabox/shared';
import { useTheme } from '@eurekabox/theme';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { ScrollArea } from '@eurekabox/ui-kit/components/ui/scroll-area';

import { useCreateContentWithCache } from '../hooks';
import { SearchDialog } from './SearchDialog';

type SideBarProps = {
    setSidebarOpen: (open: boolean) => void;
};

const SideBarHeader = ({ onClose, onClickNewPage }: { onClose: () => void; onClickNewPage: () => void }) => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    return (
        <div className="p-4 flex items-center space-x-4">
            <img
                src={isDarkTheme ? Logo.purple1 : Logo.black1}
                alt="EurekaBox Logo"
                className="h-8 cursor-pointer"
                onClick={() => navigate('/home')}
            />
            <button className="p-1 hover:bg-gray-100 rounded-md" onClick={onClose} aria-label="Toggle Sidebar">
                <ChevronsLeft className="h-5 w-5" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded-md" aria-label="Edit" onClick={onClickNewPage}>
                <SquarePen className="h-5 w-5" />
            </button>
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
    <div className="space-y-1">
        {contents.map(content => (
            <Button
                key={content.id}
                variant="ghost"
                className={`w-full justify-start font-normal text-foreground hover:bg-accent
                    ${content.id === currentContentId ? 'bg-accent' : ''}`}
                onClick={() => onContentClick(content)}
            >
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate">{content.title || 'New Page'}</span>
            </Button>
        ))}
    </div>
);

export const SideBar = ({ setSidebarOpen }: SideBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contentId } = useParams<{ contentId: string }>();
    const { isDarkTheme } = useTheme();

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { data: contentsData, isLoading } = useContents({ limit: -1 });

    const contents = useMemo(() => contentsData?.data || [], [contentsData]);

    const handleContentClick = (content: ContentView) => {
        navigate(`/${content.id}`);
    };

    const handleContentSelect = (content: ContentView) => {
        if (!content || !content.id) {
            toast({ description: `No Content!`, variant: 'destructive' });
            return;
        }
        navigate(`/${content.id}`);
    };

    const isHomePage = location.pathname === '/home';

    return (
        <div className={`w-[296px] flex flex-col h-full border-r ${isDarkTheme ? 'bg-background' : 'bg-white'}`}>
            <SideBarHeader onClose={() => setSidebarOpen(false)} onClickNewPage={handleCreate} />

            <ScrollArea className="flex-grow">
                <div className="px-3 py-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-foreground hover:bg-accent"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start text-foreground hover:bg-accent ${
                            isHomePage ? 'bg-accent' : ''
                        }`}
                        onClick={() => navigate('/home')}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </Button>

                    <div className="mt-6">
                        <h2 className="px-3 text-sm font-medium text-muted-foreground mb-2">Page</h2>
                        {isLoading && <Loader />}
                        {!isLoading && contents.length === 0 && (
                            <div className="px-3 text-sm text-muted-foreground">No Pages</div>
                        )}
                        {!isLoading && (
                            <ContentList
                                contents={contents}
                                currentContentId={contentId}
                                onContentClick={handleContentClick}
                            />
                        )}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-foreground hover:bg-accent mt-2 border border-border"
                            onClick={handleCreate}
                            disabled={isCreatePending}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Page
                        </Button>
                    </div>
                </div>
            </ScrollArea>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onContentSelect={handleContentSelect} />
        </div>
    );
};
