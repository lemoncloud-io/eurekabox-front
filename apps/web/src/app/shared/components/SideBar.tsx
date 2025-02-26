import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ChevronRight, ChevronsLeft, FileText, Home, Plus, Search, SquarePen, Star } from 'lucide-react';

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

import { useCreateChildContentWithCache, useCreateContentWithCache } from '../hooks';
import { SearchDialog } from './SearchDialog';

const MAX_CONTENT_DEPTH = 2;

export type ContentViewWithChildren = ContentView & {
    hasChild?: boolean;
    children?: ContentViewWithChildren[];
};

type SideBarProps = {
    currentContentTitle?: string;
    setSidebarOpen: (open: boolean) => void;
};

const SideBarHeader = ({ onClose, onClickNewPage }: { onClose: () => void; onClickNewPage: () => void }) => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    return (
        <div className="h-[54px] px-4 flex items-center justify-between shrink-0">
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

const ContentItem = ({
    content,
    level = 0,
    expandedItems,
    ...props
}: {
    content: ContentViewWithChildren;
    level?: number;
    currentContentId?: string;
    currentContentTitle?: string;
    onContentClick: (content: ContentView) => void;
    onCreateChildContentClick: (content: ContentView) => void;
    expandedItems: string[];
}) => (
    <AccordionItem value={`${content.id}-${level}`} key={content.id} className="border-none">
        <AccordionTrigger
            className={`group flex items-center justify-between w-full px-2 my-[1px] ${
                content.id === props.currentContentId ? 'bg-sidebar-hover text-text font-medium' : ''
            }`}
        >
            <button
                className="flex items-center"
                onClick={e => {
                    e.stopPropagation();
                    if (content.hasChild) {
                        const itemValue = `${content.id}-${level}`;
                        const isExpanded = expandedItems.includes(itemValue);
                        const newExpandedItems = isExpanded
                            ? expandedItems.filter(item => item !== itemValue)
                            : [...expandedItems, itemValue];
                        props.onExpandChange?.(newExpandedItems);
                    }
                }}
            >
                <ChevronRight
                    className={`h-4 w-4 shrink-0 text-text-700 transition-transform duration-200 group-data-[state=open]:rotate-90 ${
                        content.hasChild ? '' : 'opacity-0'
                    }`}
                />
            </button>
            <div
                className="flex-1 flex items-center gap-1 min-w-0"
                onClick={e => {
                    e.stopPropagation();
                    props.onContentClick(content);
                }}
            >
                <FileText className="h-4 w-4 shrink-0" />
                <div className="w-0 flex-1 truncate">
                    {content.id === props.currentContentId ? props.currentContentTitle : content.title}
                </div>
                {content.$activity?.isMark && (
                    <div className="relative">
                        <Star className="w-4 h-4 fill-[#FFC609] text-[#FFC609] group-hover:invisible" />
                        {level < MAX_CONTENT_DEPTH && (
                            <button
                                className="absolute top-0 left-0 invisible group-hover:visible"
                                onClick={e => {
                                    e.stopPropagation();
                                    props.onCreateChildContentClick(content);
                                }}
                            >
                                <Plus className="h-4 w-4 text-text-700" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            {!content.$activity?.isMark && level < MAX_CONTENT_DEPTH && (
                <button
                    onClick={e => {
                        e.stopPropagation();
                        props.onCreateChildContentClick(content);
                    }}
                >
                    <Plus className="h-4 w-4 text-text-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
            )}
        </AccordionTrigger>
        {content.hasChild && content.children && content.children.length > 0 && (
            <AccordionContent className="w-full">
                <div className={`pl-${level > 0 ? '4' : '0'} w-full`}>
                    {content.children.map(child => (
                        <ContentItem
                            key={child.id}
                            content={child}
                            level={level + 1}
                            {...props}
                            expandedItems={expandedItems}
                        />
                    ))}
                </div>
            </AccordionContent>
        )}
    </AccordionItem>
);

const ContentList = (props: {
    currentContentTitle?: string;
    contents: ContentViewWithChildren[];
    currentContentId?: string;
    onContentClick: (content: ContentView) => void;
    onCreateChildContentClick: (content: ContentView) => void;
    expandedItems: string[];
    onExpandChange: (expandedItems: string[]) => void;
}) => (
    <div className="space-y-1 mt-1">
        <Accordion type="multiple" value={props.expandedItems} className="w-full">
            {props.contents.map(content => (
                <ContentItem key={content.id} content={content} {...props} />
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
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [activeTitle, setActiveTitle] = useState(currentContentTitle);

    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { handleCreateChild, isPending: isCreateChildPending } = useCreateChildContentWithCache();
    const { data: contentsData, isLoading } = useContents({ limit: -1, activity: 1 });

    const allContents = useMemo(() => contentsData?.data || [], [contentsData]);
    const contentsWithChildren = useMemo(() => {
        const contentMap = new Map<string, ContentView[]>();

        allContents.forEach(content => {
            if (content.parentId) {
                if (!contentMap.has(content.parentId)) {
                    contentMap.set(content.parentId, []);
                }
                contentMap.get(content.parentId)?.push(content);
            }
        });

        const buildContentTree = (content: ContentView): ContentViewWithChildren => {
            const children = contentMap.get(content.id) || [];
            return {
                ...content,
                hasChild: contentMap.has(content.id),
                children: children.map(child => buildContentTree(child)),
            };
        };

        return allContents.filter(content => !content.parentId).map(content => buildContentTree(content));
    }, [allContents]);

    const contents = useMemo(
        () => contentsWithChildren.filter(content => !content.$activity?.isMark && !content.parentId),
        [contentsWithChildren]
    );

    const bookmarkedContents = useMemo(
        () => contentsWithChildren.filter(content => content.$activity?.isMark && !content.parentId),
        [contentsWithChildren]
    );

    useEffect(() => {
        setActiveTitle(currentContentTitle);
    }, [currentContentTitle]);

    useEffect(() => {
        if (contentId && allContents.length > 0) {
            const content = allContents.find(c => c.id === contentId);
            if (content?.parentId) {
                const expandedSet = new Set<string>();

                // Find the path from content to root
                const findParentPath = (currentId: string) => {
                    const current = allContents.find(c => c.id === currentId);
                    if (!current) return [];

                    if (!current.parentId) return [current.id];

                    return [...findParentPath(current.parentId), current.id];
                };

                const parentPath = findParentPath(content.parentId);

                // Create expanded items with correct levels
                parentPath.forEach((id, index) => {
                    expandedSet.add(`${id}-${index}`);
                });

                setExpandedItems(Array.from(expandedSet));
            }
        }
    }, [contentId, allContents]);

    const handleContentClick = (content: ContentView) => {
        if (content.id === contentId) {
            return;
        }
        setActiveTitle(content.title);
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
        if (!parent || !parent.id) {
            return;
        }
        console.log(parent);
        handleCreateChild(parent.id);
    };

    const handleExpandChange = (newExpandedItems: string[]) => {
        setExpandedItems(newExpandedItems);
    };

    const isHomePage = location.pathname === '/home';

    return (
        <div className="w-[248px] flex flex-col h-full bg-sidebar">
            <SideBarHeader onClose={() => setSidebarOpen(false)} onClickNewPage={handleCreate} />
            <ScrollArea className="flex-grow">
                <div className="px-3 pb-6 mt-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-text-700 px-2 hover:bg-transparent"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-4 w-4" />
                        {t('sidebar.search')}
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full h-[29px] justify-start text-text-700 px-2 hover:bg-sidebar-hover ${
                            isHomePage ? 'bg-sidebar-hover text-text font-medium' : ''
                        }`}
                        onClick={() => navigate('/home')}
                    >
                        <Home className="h-4 w-4" />
                        {t('sidebar.home')}
                    </Button>
                    <div className="mt-[22px]">
                        <h2 className="px-2 text-xs text-dim font-medium">{t('sidebar.sections.bookmark')}</h2>
                        {bookmarkedContents.length === 0 ? (
                            <div className="px-4 text-sm text-dim">{t('sidebar.noBookmarks')}</div>
                        ) : (
                            <ContentList
                                currentContentTitle={activeTitle}
                                contents={bookmarkedContents}
                                currentContentId={contentId}
                                onContentClick={handleContentClick}
                                onCreateChildContentClick={handleCreateChildContent}
                                expandedItems={expandedItems}
                                onExpandChange={handleExpandChange}
                            />
                        )}
                    </div>
                    <div className="mt-[22px]">
                        <h2 className="px-2 text-xs text-dim font-medium">{t('sidebar.sections.page')}</h2>
                        {isLoading && <Loader />}
                        {!isLoading && contents.length === 0 && (
                            <div className="px-4 text-sm text-dim">{t('sidebar.noPages')}</div>
                        )}
                        {!isLoading && (
                            <ContentList
                                currentContentTitle={activeTitle}
                                contents={contents}
                                currentContentId={contentId}
                                onContentClick={handleContentClick}
                                onCreateChildContentClick={handleCreateChildContent}
                                expandedItems={expandedItems}
                                onExpandChange={handleExpandChange}
                            />
                        )}
                        <div className="px-2">
                            <Button
                                variant="ghost"
                                className="mt-[22px] dark:bg-[#3A3C40] dark:border-[#53555B] w-full h-[33px] text-text-800 border border-text-700 font-medium hover:text-[#84888F] hover:border-[#84888F]"
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
            <SearchDialog
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                onContentSelect={handleContentSelect}
                contentsWithChildren={contentsWithChildren}
            />
        </div>
    );
};
