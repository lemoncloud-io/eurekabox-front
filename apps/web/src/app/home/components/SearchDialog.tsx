import { useMemo, useState } from 'react';

import { ChevronLeft, FileText, Search } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { useContents } from '@eurekabox/contents';
import { Input } from '@eurekabox/lib/components/ui/input';
import { ScrollArea } from '@eurekabox/lib/components/ui/scroll-area';
import { Loader, useDebounce } from '@eurekabox/shared';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContentSelect: (content: ContentView) => void;
}

const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm: string }) => {
    if (!searchTerm) return <>{text}</>;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

export const SearchDialog = ({ open, onOpenChange, onContentSelect }: SearchDialogProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 200);
    const { data: contentsData, isLoading } = useContents({ limit: -1 });

    const filteredResults = useMemo(() => {
        if (!debouncedSearchTerm || !contentsData?.data) return [];

        const searchTermLower = debouncedSearchTerm.toLowerCase();
        return contentsData.data.filter(
            content =>
                content.title?.toLowerCase().includes(searchTermLower) ||
                content.readme?.toLowerCase().includes(searchTermLower)
        );
    }, [contentsData?.data, debouncedSearchTerm]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle></DialogTitle>
            <DialogContent className="max-w-[650px] p-0">
                <div className="flex flex-col h-[240px] p-3">
                    <div className="flex items-center gap-[6px]">
                        <DialogClose asChild>
                            <button className="text-text">
                                <ChevronLeft />
                            </button>
                        </DialogClose>
                        <div className="w-full h-[37px] bg-input  p-2 rounded-[6px] flex items-center">
                            <Search className="h-4 w-4 text-text" />
                            <Input
                                type="text"
                                placeholder="Enter search term"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border-none text-text"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-grow mt-[18px]">
                        <div className="space-y-1">
                            {isLoading ? (
                                <Loader message={'Loading...'} />
                            ) : (
                                <>
                                    {filteredResults.map(result => (
                                        <div
                                            key={result.id}
                                            onClick={() => {
                                                onContentSelect(result);
                                                onOpenChange(false);
                                            }}
                                            className="flex space-x-2 p-1 rounded-[4px] hover:bg-accent transition-colors cursor-pointer"
                                        >
                                            <FileText className="w-4 h-4 mt-[2px] text-text" />
                                            <div>
                                                <h3 className="text-text">
                                                    <HighlightedText
                                                        text={result.title || 'New Page'}
                                                        searchTerm={debouncedSearchTerm}
                                                    />
                                                </h3>
                                                {result.readme && (
                                                    <p className="text-xs text-dim">
                                                        <HighlightedText
                                                            text={result.readme}
                                                            searchTerm={debouncedSearchTerm}
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredResults.length === 0 && debouncedSearchTerm && (
                                        <p className="text-center text-dim py-[50px]">검색 결과가 없습니다.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
