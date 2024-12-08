import { Button } from '@lemonote/ui-kit/components/ui/button';
import { Images } from '@lemonote/assets';
import { Card } from '@lemonote/ui-kit/components/ui/card';
import { FileText, Menu, Plus, Search, Sidebar } from 'lucide-react';
import { ScrollArea } from '@lemonote/ui-kit/components/ui/scroll-area';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SideBar } from '../components';

export const EditorPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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
                            <h1 className="text-xl font-semibold gradient-text">New Document</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                            <Link to="/login">
                                <Button variant="ghost" size="icon" className="hover:text-primary">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto p-6">TODO</main>
                </div>
            </div>
            <Button
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
                size="icon"
            >
                <Plus className="h-6 w-6" />
                <span className="sr-only">New page</span>
            </Button>
        </div>
    );
};
