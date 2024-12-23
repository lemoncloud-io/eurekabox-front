import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { FileDown, FileUp, Menu, Plus, Save, Search, Trash2 } from 'lucide-react';
import { ReactNode, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SideBar, ThemeToggle } from '../components';
import { Loader } from '@eurekabox/shared';
import { CreateContentDTO, useCreateContent, useDeleteContent } from '@eurekabox/contents';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@eurekabox/ui-kit/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useContentCache, useCreateContentWithCache } from '../hooks';
import { SearchDialog } from '../components';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { Separator } from '@eurekabox/lib/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';

interface EditorLayoutProps {
    children: ReactNode;
    isDashboard?: boolean;
    title: string;
    isLoading: boolean;
    onTitleChange?: (title: string) => void;
    handleSave?: () => void;
    handleExportPDF?: () => void;
}

export const EditorLayout = ({
    children,
    contentId,
    isDashboard = false,
    title,
    isLoading = false,
    onTitleChange,
    handleSave,
    handleExportPDF,
}: EditorLayoutProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { removeContentFromInfiniteCache } = useContentCache();
    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { prependContentToInfiniteCache } = useContentCache();
    const createContent = useCreateContent();
    const deleteContent = useDeleteContent();

    const handleSaveClick = async () => {
        if (handleSave) {
            handleSave();
        }
    };

    const handleExportPDFClick = async () => {
        if (handleExportPDF) {
            handleExportPDF();
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
                    prependContentToInfiniteCache(response);
                    navigate(`/home/${response.id}`);
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
                removeContentFromInfiniteCache(contentId);
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
        navigate(`/home/${content.id}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <div className="flex h-screen">
                <div
                    className={`transition-all duration-300 ease-in-out ${
                        sidebarOpen ? 'w-64' : 'w-0'
                    } overflow-hidden`}
                >
                    <SideBar />
                </div>
                <div className="flex-1 flex flex-col">
                    <header className="flex items-center justify-between p-4 glassmorphism">
                        <div className="flex items-center gap-4 w-full">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hover:text-primary"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle sidebar</span>
                            </Button>
                            {isLoading ? (
                                <Loader message={''} />
                            ) : (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => onTitleChange?.(e.target.value)}
                                    className="w-full text-xl font-semibold gradient-text border-none focus:outline-none caret-black dark:caret-white"
                                    placeholder="Untitled"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {!isDashboard && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-primary"
                                        onClick={handleExportPDFClick}
                                    >
                                        <FileDown className="h-5 w-5" />
                                        <span className="sr-only">PDF 내보내기</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-primary"
                                        onClick={handleSaveClick}
                                        disabled={isLoading}
                                    >
                                        <Save className="h-5 w-5" />
                                        <span className="sr-only">저장</span>
                                    </Button>
                                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-destructive"
                                                onClick={handleDelete}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                                <span className="sr-only">삭제</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you sure you want to delete this document?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. The document will be permanently
                                                    deleted.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>취소</AlertDialogCancel>
                                                <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Separator orientation="vertical" className="h-6" />
                                </>
                            )}
                            {isDashboard && (
                                <>
                                    <input
                                        type="file"
                                        accept=".md,.html"
                                        onChange={handleImportMarkdownClick}
                                        style={{ display: 'none' }}
                                        id="markdown-upload"
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:text-primary"
                                                    onClick={() => document.getElementById('markdown-upload')?.click()}
                                                >
                                                    <FileUp className="h-5 w-5" />
                                                    <span className="sr-only">import</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Markdown, HTML 가져오기</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:text-primary"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>

                            <ThemeToggle />
                            <Link to="/auth/logout">
                                <Button variant="ghost" className="hover:text-primary">
                                    Logout
                                </Button>
                            </Link>
                        </div>
                    </header>
                    <main className="flex-1 p-6 overflow-auto">{children}</main>
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
