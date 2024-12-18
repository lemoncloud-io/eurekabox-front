import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@lemonote/ui-kit/components/ui/dialog';
import { ScrollArea } from '@lemonote/lib/components/ui/scroll-area';
import { Input } from '@lemonote/lib/components/ui/input';
import { FileText } from 'lucide-react';
import { ContentView } from '@lemoncloud/lemon-contents-api';
import { useContents } from '@lemonote/contents';
import { Loader, useDebounce } from '@lemonote/shared';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContentSelect: (content: ContentView) => void;
}

export const SearchDialog = ({ open, onOpenChange, onContentSelect }: SearchDialogProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 200);

    const { data, isLoading } = useContents({
        limit: 100,
        keyword: debouncedSearchTerm || '',
    });

    const results = data?.data || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle>Search</DialogTitle>
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
                                <Loader message={'Searching...'} />
                            ) : (
                                <>
                                    {results.map(result => (
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
                                                <h3 className="font-semibold">{result.title}</h3>
                                                <p className="text-sm text-muted-foreground">{result.subject}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {results.length === 0 && debouncedSearchTerm && (
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
