import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ChevronRight, ChevronsLeft, FileText, Home, Plus, Search, SquarePen } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { Logo } from '@eurekabox/assets';
import { useContents } from '@eurekabox/contents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Loader } from '@eurekabox/shared';
import { useTheme } from '@eurekabox/theme';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@eurekabox/ui-kit/components/ui/accordion';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { ScrollArea } from '@eurekabox/ui-kit/components/ui/scroll-area';

import { useCreateContentWithCache } from '../hooks';
import { SearchDialog } from './SearchDialog';

type SideBarProps = {
    currentContentTitle?: string;
    setSidebarOpen: (open: boolean) => void;
};

const SideBarHeader = ({ onClose, onClickNewPage }: { onClose: () => void; onClickNewPage: () => void }) => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    return (
        <div className="h-[54px] px-4 flex items-center justify-between">
            <img
                src={isDarkTheme ? Logo.purple1 : Logo.black1}
                alt="EurekaBox Logo"
                className="h-[30px] cursor-pointer"
                onClick={() => navigate('/home')}
            />
            <div className="flex items-center gap-[9px]">
                <button onClick={onClose} aria-label="Toggle Sidebar">
                    <ChevronsLeft className="h-[18px] w-[18px]  hover:text-[#BABCC0]" />
                </button>
                <button aria-label="Edit" onClick={onClickNewPage}>
                    <SquarePen className="h-[18px] w-[18px]  hover:text-[#BABCC0]" />
                </button>
            </div>
        </div>
    );
};

const ContentList = ({
    currentContentTitle,
    contents,
    currentContentId,
    onContentClick,
    onCreateChildContentClick,
}: {
    currentContentTitle?: string;
    contents: ContentView[];
    currentContentId?: string;
    onContentClick: (content: ContentView) => void;
    onCreateChildContentClick: (content: ContentView) => void;
}) => (
    <div className="space-y-1 mt-1">
        <Accordion type="single" collapsible className="w-full flex flex-col gap-[2px]">
            {contents.map(content => (
                <AccordionItem value={content.title} key={content.id} className="border-none">
                    <AccordionTrigger
                        className={`group flex items-center justify-between ${
                            content.id === currentContentId ? 'bg-sidebar-hover text-text font-medium' : ''
                        }`}
                        onClick={() => onContentClick(content)}
                    >
                        <ChevronRight className="h-4 w-4 shrink-0 text-text-700 transition-transform duration-200 opacity-0" />
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                            <FileText className="h-4 w-4 shrink-0" />
                            <div className="w-0 flex-1 truncate">
                                {content.id === currentContentId ? currentContentTitle : content.title}
                            </div>
                        </div>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onCreateChildContentClick(content);
                            }}
                        >
                            <Plus className="h-4 w-4 text-text-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                    </AccordionTrigger>
                    {content['hasChild'] && (
                        <AccordionContent>
                            <div className="p-1 flex items-center">
                                <ChevronRight className="h-4 w-4 shrink-0 text-text-700 transition-transform duration-200" />
                                <div className="flex-1 flex items-center gap-1 min-w-0">
                                    <FileText className="h-4 w-4" />
                                    <div className="flex-1">Page Title2-1</div>
                                </div>
                            </div>
                        </AccordionContent>
                    )}
                </AccordionItem>
            ))}
        </Accordion>
    </div>
);

export const SideBar = ({ currentContentTitle, setSidebarOpen }: SideBarProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { contentId } = useParams<{ contentId: string }>();

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { data: contentsData, isLoading } = useContents({ limit: -1 });

    const contents = useMemo(() => contentsData?.data || [], [contentsData]);

    const handleContentClick = (content: ContentView) => {
        navigate(`/${content.id}`);
    };

    const handleContentSelect = (content: ContentView) => {
        if (!content || !content.id) {
            toast({ description: t('sidebar.toast.noContent'), variant: 'destructive' });
            return;
        }
        navigate(`/${content.id}`);
    };

    const handleCreateChildContent = (parent: ContentView) => {
        // TODO: create child content
    };

    const isHomePage = location.pathname === '/home';

    return (
        <div className="w-[248px] flex flex-col h-full bg-sidebar">
            <SideBarHeader onClose={() => setSidebarOpen(false)} onClickNewPage={handleCreate} />
            <ScrollArea className="flex-grow">
                <div className="px-3">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-text-700 hover:bg-transparent"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-4 w-4" />
                        {t('sidebar.search')}
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full h-[29px] justify-start text-text-700 hover:bg-sidebar-hover ${
                            isHomePage ? 'bg-sidebar-hover text-text font-medium' : ''
                        }`}
                        onClick={() => navigate('/home')}
                    >
                        <Home className="h-4 w-4" />
                        {t('sidebar.home')}
                    </Button>
                    {/* TODO: bookmark */}
                    {/* <div className="mt-[22px]">
                        <h2 className="px-2 text-xs text-dim font-medium">{t('sidebar.sections.bookmark')}</h2>
                        <Button variant="ghost" className=" h-[29px] justify-between font-normal text-text-700">
                            <div className="w-[175px] flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="truncate">page</span>
                            </div>
                            <button>
                                <Star className="w-4 h-4 fill-[#FFC609] text-[#FFC609]" />
                            </button>
                        </Button>
                    </div> */}
                    <div className="mt-[22px]">
                        <h2 className="px-2 text-xs text-dim font-medium">{t('sidebar.sections.page')}</h2>
                        {isLoading && <Loader />}
                        {!isLoading && contents.length === 0 && (
                            <div className="px-4 text-sm text-dim">{t('sidebar.noPages')}</div>
                        )}
                        {!isLoading && (
                            <ContentList
                                currentContentTitle={currentContentTitle}
                                contents={contents}
                                currentContentId={contentId}
                                onContentClick={handleContentClick}
                                onCreateChildContentClick={handleCreateChildContent}
                            />
                        )}
                        <div className="px-2">
                            <Button
                                variant="ghost"
                                className="mt-[22px] dark:bg-[#3A3C40] dark:border-[#53555B] w-full h-[33px] text-text-800 border border-text-700 font-medium"
                                onClick={handleCreate}
                                disabled={isCreatePending}
                            >
                                <Plus className="h-4 w-4 text-text-800" />
                                {t('sidebar.newPage')}
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onContentSelect={handleContentSelect} />
        </div>
    );
};
