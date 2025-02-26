import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import i18n from 'i18next';
import { Download, EllipsisVertical, LogOut, Menu, Save, Star, Trash2 } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';
import { createAsyncDelay } from '@lemoncloud/lemon-web-core';

import { Images } from '@eurekabox/assets';
import { contentsKeys, useContent, useCreateContent, useDeleteContent, useUpdateActivity } from '@eurekabox/contents';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { Image } from '@eurekabox/lib/components/ui/image';
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

import { SearchDialog, SideBar, ThemeToggle } from '../../../shared';
import { useContentCache, useCreateContentWithCache } from '../../../shared';

interface EditorLayoutProps {
    children: ReactNode;
    contentId: string;
    title: string;
    isLoading: boolean;
    handleSave?: () => void;
    handleExport?: (type: 'markdown' | 'html') => void;
}

export const EditorLayout = ({
    children,
    contentId,
    title,
    isLoading = false,
    handleSave,
    handleExport,
}: EditorLayoutProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: content, isLoading: isContentLoading } = useContent(contentId);

    const [language, setLanguage] = useState<string>(i18n.language || 'en');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { removeContentFromCache } = useContentCache();
    const { handleCreate, isPending: isCreatePending } = useCreateContentWithCache();
    const { prependContentToCache } = useContentCache();
    const createContent = useCreateContent();
    const deleteContent = useDeleteContent();
    const updateActivity = useUpdateActivity();

    const handleBookmarkClick = async () => {
        if (!content || !content.id) {
            return;
        }

        const isMark = content.$activity?.isMark ?? false;
        await updateActivity.mutateAsync(
            { contentId: content.id, mark: !isMark },
            {
                onSuccess: async response => {
                    queryClient.setQueryData(contentsKeys.detail(content.id), {
                        ...content,
                        $activity: response.$activity,
                    });
                    await createAsyncDelay(500);
                    await queryClient.invalidateQueries(contentsKeys.lists() as never);
                },
            }
        );
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'ko' : 'en';
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

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

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!content || !content.id) {
            return;
        }
        await deleteContent.mutateAsync(content.id, {
            onSuccess: async () => {
                removeContentFromCache(content.id);
                toast({ description: `Successfully deleted.` });
                navigate('/home');
            },
        });
    };

    const handleContentSelect = (content: ContentView) => {
        if (!content || !content.id) {
            toast({ description: t('editor.noContent'), variant: 'destructive' });
            return;
        }
        navigate(`/${content.id}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <div className="h-screen flex flex-col">
                <div
                    className={`transition-all duration-300 ease-in-out fixed top-0 bottom-0 left-0 ${
                        sidebarOpen ? 'w-[248px]' : 'w-0'
                    } overflow-hidden`}
                >
                    <SideBar currentContentTitle={title} setSidebarOpen={setSidebarOpen} />
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
                                placeholder={t('editor.newPage')}
                            />
                        </div>
                        <div className="flex items-center gap-2">
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
                                        <span>{t('editor.save')}</span>
                                    </>
                                )}
                            </Button>
                            <button onClick={handleBookmarkClick} disabled={updateActivity.isPending}>
                                {updateActivity.isPending ? (
                                    <Loader className={`space-x-0`} message={''} />
                                ) : (
                                    <Star
                                        className={`w-4 h-4 ${
                                            content?.$activity?.isMark
                                                ? 'fill-[#FFC609] text-[#FFC609]'
                                                : 'fill-none text-text-800'
                                        }`}
                                    />
                                )}
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <EllipsisVertical className="w-4 h-4" />
                                        <span className="sr-only">{t('editor.more')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[224px] px-2 py-[6px] mr-2 ">
                                    <div className="py-1 flex items-center justify-center mb- gap-[14px]">
                                        <ThemeToggle />
                                        <Button
                                            variant="ghost"
                                            className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-accent p-0"
                                            onClick={toggleLanguage}
                                        >
                                            <Image
                                                src={language === 'en' ? Images.kr : Images.en}
                                                darkSrc={language === 'en' ? Images.krDark : Images.enDark}
                                                alt={language === 'en' ? 'Korean' : 'English'}
                                            />
                                        </Button>
                                    </div>

                                    <DropdownMenuItem onClick={() => handleClickExport('markdown')}>
                                        <Download className="h-4 w-4" />
                                        <span>{t('editor.export.markdown')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleClickExport('html')}>
                                        <Download className="h-4 w-4" />
                                        <span>{t('editor.export.html')}</span>
                                    </DropdownMenuItem>
                                    <div className="p-2 py-1 rounded-[4px] hover:bg-accent">
                                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="w-full flex items-center gap-2"
                                                    onClick={handleDelete}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>{t('editor.delete.button')}</span>
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('editor.delete.title')}</AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('editor.delete.cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={confirmDelete}>
                                                        {t('editor.delete.confirm')}
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
                                    <DropdownMenuItem>
                                        <Link to="/auth/logout" className="w-full">
                                            <div className="w-full flex items-center gap-2">
                                                <LogOut className="w-4 h-4" />
                                                <span>{t('editor.logout')}</span>
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
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onContentSelect={handleContentSelect} />
        </div>
    );
};
