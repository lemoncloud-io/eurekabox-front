import { useMemo, useState } from 'react';

import { FileText } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { useContents } from '@eurekabox/contents';
import { Input } from '@eurekabox/lib/components/ui/input';
import { ScrollArea } from '@eurekabox/lib/components/ui/scroll-area';
import { Loader, useDebounce } from '@eurekabox/shared';
import { Dialog, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';

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
            <DialogContent className="sm:max-w-[700px] p-0">
                <div className="flex flex-col h-[80vh]">
                    <div className="p-4 border-b">
                        <Input
                            type="text"
                            placeholder="검색어를 입력하세요..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="text-lg"
                            autoFocus
                        />
                    </div>
                    <ScrollArea className="flex-grow">
                        <div className="p-4 space-y-4">
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
                                            className="flex items-start space-x-4 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                        >
                                            <FileText className="w-6 h-6 mt-1 text-blue-500" />
                                            <div>
                                                <h3 className="font-semibold">
                                                    <HighlightedText
                                                        text={result.title || 'New Page'}
                                                        searchTerm={debouncedSearchTerm}
                                                    />
                                                </h3>
                                                {result.readme && (
                                                    <p className="text-sm text-muted-foreground">
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
                                        <p className="text-center text-muted-foreground">검색 결과가 없습니다.</p>
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
