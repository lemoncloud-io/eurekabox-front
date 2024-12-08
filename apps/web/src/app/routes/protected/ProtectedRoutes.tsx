import { Navigate } from 'react-router-dom';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@lemonote/ui-kit/components/ui/button';
import { Menu, Search, Plus, FileText } from 'lucide-react';
import { ScrollArea } from '@lemonote/ui-kit/components/ui/scroll-area';

function Sidebar({ className }) {
    const documents = [
        { id: 1, title: 'Getting Started Guide' },
        { id: 2, title: 'Project Overview' },
        { id: 3, title: 'Technical Documentation' },
        { id: 4, title: 'Meeting Notes' },
        { id: 5, title: 'Research Findings' },
    ];

    return (
        <div className={`w-64 flex flex-col h-full ${className}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold mb-4 gradient-text">Lemonote</h1>
                <Button className="w-full justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    New page
                </Button>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-2">
                    {documents.map(doc => (
                        <Button
                            key={doc.id}
                            variant="ghost"
                            className="w-full justify-start font-normal hover:bg-primary/10 dark:hover:bg-primary/20"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {doc.title}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

export function Home() {
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
                    <Sidebar className="h-full glassmorphism" />
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
}

export const ProtectedRoutes = [
    { path: `/home/*`, element: <Home /> },
    { path: '*', element: <Navigate to="/home" replace /> },
    { path: '/', element: <Navigate to="/home" replace /> },
];
