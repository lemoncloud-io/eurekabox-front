import { Button } from '@lemonote/ui-kit/components/ui/button';
import { Menu, Plus, Save, Search } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { SideBar, ThemeToggle } from '../components';
import { Loader } from '@lemonote/shared';

interface EditorLayoutProps {
    children: ReactNode;
    title: string;
    isLoading: boolean;
    onTitleChange?: (title: string) => void;
    handleSave?: () => void;
}

export const EditorLayout = ({ children, title, isLoading = false, onTitleChange, handleSave }: EditorLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                        <div className="flex items-center gap-4">
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
                                    className="text-xl font-semibold gradient-text border-none focus:outline-none"
                                    placeholder="Untitled"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="hover:text-primary" onClick={handleSave}>
                                <Save className="h-5 w-5" />
                                <span className="sr-only">저장</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                            <ThemeToggle />
                            <Link href="/login">
                                <Button variant="ghost" size="icon" className="hover:text-primary">
                                    Login
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
