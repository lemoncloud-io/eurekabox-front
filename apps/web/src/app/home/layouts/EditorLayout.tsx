import { Button } from '@lemonote/ui-kit/components/ui/button';
import { Menu, Plus, Save, Search, Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SideBar, ThemeToggle } from '../components';
import { Loader } from '@lemonote/shared';
import { contentsKeys, CreateContentDTO, useCreateContent, useDeleteContent } from '@lemonote/contents';
import { toast } from '@lemonote/ui-kit/hooks/use-toast';
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
} from '@lemonote/ui-kit/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

interface EditorLayoutProps {
    children: ReactNode;
    isDashboard?: boolean;
    title: string;
    isLoading: boolean;
    onTitleChange?: (title: string) => void;
    handleSave?: () => void;
}

export const EditorLayout = ({
    children,
    contentId,
    isDashboard = false,
    title,
    isLoading = false,
    onTitleChange,
    handleSave,
}: EditorLayoutProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const createContent = useCreateContent();
    const deleteContent = useDeleteContent();

    const handleSaveClick = async () => {
        if (handleSave) {
            handleSave();
        }
    };

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

    const removeContentFromInfiniteCache = (contentId: string) => {
        queryClient.setQueryData(contentsKeys.list({ limit: 10, page: 0 }), (oldData: any) => {
            if (!oldData) {
                return oldData;
            }
            // 모든 페이지를 순회하면서 해당 contentId를 가진 아이템 제거
            const newPages = oldData.pages.map(page => ({
                ...page,
                list: page.list.filter(item => item.id !== contentId),
                total: page.total - 1, // total 감소
            }));
            return {
                ...oldData,
                pages: newPages,
            };
        });
    };

    const handleClickCreate = async () => {
        const newContent: CreateContentDTO = {
            name: '',
            title: 'Untitled',
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
                                        onClick={handleSaveClick}
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
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="hover:text-primary">
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
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
            <Button
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
                size="icon"
                disabled={createContent.isPending}
                onClick={handleClickCreate}
            >
                {createContent.isPending ? (
                    <Loader className="text-white space-x-0" message={''} />
                ) : (
                    <Plus className="h-6 w-6" />
                )}
            </Button>
        </div>
    );
};
