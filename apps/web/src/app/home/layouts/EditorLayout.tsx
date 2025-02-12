import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Download, EllipsisVertical, FileUp, LogOut, Menu, Plus, Save, Trash2 } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import type { CreateContentDTO } from '@eurekabox/contents';
import { useCreateContent, useDeleteContent } from '@eurekabox/contents';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { Loader } from '@eurekabox/shared';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@eurekabox/ui-kit/components/ui/alert-dialog';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';

import { SideBar, ThemeToggle } from '../components';
import { SearchDialog } from '../components';
import { useContentCache, useCreateContentWithCache } from '../hooks';

interface EditorLayoutProps {
    children: ReactNode;
    isDashboard?: boolean;
    title: string;
    isLoading: boolean;
    handleSave?: () => void;
    handleExport?: () => void;
}

export const EditorLayout = ({
    children,
    contentId,
    isDashboard = false,
    title,
    isLoading = false,
    handleSave,
    handleExport,
}: EditorLayoutProps) => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { removeContentFromCache } = useContentCache();
    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { prependContentToCache } = useContentCache();
    const createContent = useCreateContent();
    const deleteContent = useDeleteContent();

    const handleSaveClick = async () => {
        if (handleSave) {
            handleSave();
        }
    };

    const handleClickExport = async (type: 'markdown' | 'html') => {
        if (handleExport) {
            handleExport(type);
        }
    };

    const handleImportMarkdownClick = useCallback(async () => {
        // eslint-disable-next-line no-restricted-globals
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            if (!(file.name.endsWith('.md') || file.name.endsWith('.html'))) {
                toast({
                    variant: 'destructive',
                    title: '잘못된 파일 형식',
                    description: '.md, .html 파일만 업로드 가능합니다.',
                });
                return;
            }

            const title = file.name.substring(0, file.name.lastIndexOf('.'));
            const text = await file.text();

            const newContent: CreateContentDTO = {
                name: '',
                subject: '',
                title,
                readme: text,
            };

            await createContent.mutateAsync(newContent, {
                onSuccess: (response: ContentView) => {
                    prependContentToCache(response);
                    navigate(`/${response.id}`);
                },
            });
        } catch (error) {
            console.error('Markdown upload failed:', error);
            toast({
                variant: 'destructive',
                title: '파일 업로드 실패',
                description: '마크다운 파일을 읽는 중 오류가 발생했습니다.',
            });
        }

        // eslint-disable-next-line no-restricted-globals
        event.target.value = '';
    }, [toast]);

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!contentId) {
            return;
        }
        await deleteContent.mutateAsync(contentId, {
            onSuccess: async () => {
                removeContentFromCache(contentId);
                toast({ description: `Successfully deleted.` });
                navigate('/home');
            },
        });
    };

    const handleContentSelect = (content: ContentView) => {
        if (!content || !content.id) {
            toast({ description: `No Content!`, variant: 'destructive' });
            return;
        }
        navigate(`/${content.id}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <div className="h-screen flex flex-col">
                <div
                    className={`transition-all duration-300 ease-in-out fixed top-0 bottom-0 left-0 z-10 ${
                        sidebarOpen ? 'w-[248px]' : 'w-0'
                    } overflow-hidden`}
                >
                    <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>
                <div
                    className={`w-full flex-1 flex flex-col overflow-auto duration-300 ease-in-out transition-padding ${
                        sidebarOpen ? 'pl-[248px] max-md:pl-0' : 'pl-0'
                    }`}
                >
                    <header className="h-[54px] flex items-center justify-between p-5">
                        <div className="flex items-center w-full gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(true)}
                                className={`${sidebarOpen ? 'hidden' : ''}`}
                            >
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle sidebar</span>
                            </Button>
                            <input
                                type="text"
                                value={title}
                                disabled={true}
                                className="w-full bg-background font-medium border-none focus:outline-none caret-text-text"
                                placeholder={isDashboard ? '' : 'New Page'}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {!isDashboard && (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="h-[26px] px-[6px] rounded-sm gap-[6px] text-text-800 border border-text-800"
                                        onClick={handleSaveClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader message={''} />
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save</span>
                                            </>
                                        )}
                                    </Button>
                                    {/* TODO: bookmark */}
                                    {/* <button>
                                        <Star className="w-4 h-4 fill-[#FFC609] text-[#FFC609]" />
                                    </button> */}
                                </>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <EllipsisVertical className="w-4 h-4" />
                                        <span className="sr-only">더보기</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[224px] px-2 py-[6px] mr-2">
                                    <div className="py-1 flex items-center justify-center mb-1">
                                        <ThemeToggle />
                                    </div>

                                    {!isDashboard && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleClickExport('markdown')}>
                                                <Download className="h-4 w-4" />
                                                <span>Export as Markdown</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleClickExport('html')}>
                                                <Download className="h-4 w-4" />
                                                <span>Export as HTML</span>
                                            </DropdownMenuItem>
                                            <div className="p-2 py-1 rounded-[4px] hover:bg-accent">
                                                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="w-full flex items-center gap-2"
                                                            onClick={handleDelete}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Trash</span>
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Are you sure you want to delete this document?
                                                            </AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={confirmDelete}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                            {/*<DropdownMenuSeparator />
                                             <DropdownMenuItem>
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </DropdownMenuItem> */}
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    {isDashboard && (
                                        <DropdownMenuItem>
                                            <input
                                                type="file"
                                                accept=".md,.html"
                                                onChange={handleImportMarkdownClick}
                                                style={{ display: 'none' }}
                                                id="markdown-upload"
                                            />
                                            <button
                                                className="w-full flex items-center gap-2"
                                                onClick={() => document.getElementById('markdown-upload')?.click()}
                                            >
                                                <FileUp className="h-4 w-4" />
                                                <span>Markdown, HTML 가져오기</span>
                                            </button>
                                        </DropdownMenuItem>
                                    )}
                                    {/* <Button
                                variant="ghost"
                                size="icon"
                                className="hover:text-primary"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button> */}
                                    <DropdownMenuItem>
                                        <Link to="/auth/logout" className="w-full">
                                            <div className="w-full flex items-center gap-2">
                                                <LogOut className="w-4 h-4" />
                                                <span>Log out</span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto">{children}</main>
                </div>
            </div>
            <Button
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
                size="icon"
                disabled={isCreatePending}
                onClick={handleCreate}
            >
                {isCreatePending ? (
                    <Loader className="text-white space-x-0" message={''} />
                ) : (
                    <Plus className="h-6 w-6" />
                )}
            </Button>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onContentSelect={handleContentSelect} />
        </div>
    );
};
