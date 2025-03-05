import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import i18n from 'i18next';
import { EllipsisVertical, FileUp, LogOut, Menu } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { Images } from '@eurekabox/assets';
import type { CreateContentDTO } from '@eurekabox/contents';
import { useCreateContent } from '@eurekabox/contents';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { Image } from '@eurekabox/lib/components/ui/image';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { toast } from '@eurekabox/ui-kit/hooks/use-toast';

import { SideBar, ThemeToggle } from '../components';
import { useContentCache } from '../hooks';

export const DefaultLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<string>(i18n.language || 'en');

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { prependContentToCache } = useContentCache();
    const createContent = useCreateContent();

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'ko' : 'en';
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

    const handleImportMarkdownClick = useCallback(async () => {
        // eslint-disable-next-line no-restricted-globals
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            if (!(file.name.endsWith('.md') || file.name.endsWith('.html'))) {
                toast({
                    variant: 'destructive',
                    title: t('editor.import.error.wrongFormat'),
                    description: t('editor.import.error.invalidFormat'),
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
                title: t('editor.import.error.wrongFormat'),
                description: t('editor.import.error.uploadFailed'),
            });
        }

        // eslint-disable-next-line no-restricted-globals
        event.target.value = '';
    }, [toast]);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <div className="h-screen flex flex-col">
                <div
                    className={`transition-all duration-300 ease-in-out fixed top-0 bottom-0 left-0 ${
                        sidebarOpen ? 'w-[248px]' : 'w-0'
                    } overflow-hidden`}
                >
                    <SideBar setSidebarOpen={setSidebarOpen} />
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
                        </div>
                        <div className="flex items-center gap-2">
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
                                            <span>{t('editor.import.title')}</span>
                                        </button>
                                    </DropdownMenuItem>
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
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};
