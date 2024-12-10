import { Button } from '@lemonote/ui-kit/components/ui/button';
import { Menu, Plus, Save, Search, Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SideBar, ThemeToggle } from '../components';
import { Loader } from '@lemonote/shared';
import { contentsKeys, useDeleteContent } from '@lemonote/contents';
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
import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import { useQueryClient } from '@tanstack/react-query';

interface EditorLayoutProps {
    children: ReactNode;
    title: string;
    isLoading: boolean;
    onTitleChange?: (title: string) => void;
    handleSave?: () => void;
}

export const EditorLayout = ({ children, title, isLoading = false, onTitleChange, handleSave }: EditorLayoutProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { contentId } = useParams<{ contentId: string }>();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const deleteContent = useDeleteContent();

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!contentId) {
            return;
        }
        await deleteContent.mutateAsync(contentId, {
            onSuccess: async () => {
                toast({ description: `Successfully deleted.` });
                navigate('/home');
                await createAsyncDelay(500);
                queryClient.invalidateQueries(contentsKeys.lists() as never);
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
                            <Button variant="ghost" size="icon" className="hover:text-primary" onClick={handleSave}>
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
                                            This action cannot be undone. The document will be permanently deleted.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
                    <main className="flex-1 overflow-auto p-6">{children}</main>
                </div>
            </div>
            <Button
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
                size="icon"
                as={Link}
                to="/home/create"
            >
                <Plus className="h-6 w-6" />
                <span className="sr-only">New page</span>
            </Button>
        </div>
    );
};
