import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeft, FileText, Search, X } from 'lucide-react';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import { Input } from '@eurekabox/lib/components/ui/input';
import { ScrollArea } from '@eurekabox/lib/components/ui/scroll-area';
import { useDebounce } from '@eurekabox/shared';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';

import type { ContentViewWithChildren } from './SideBar';

interface SearchDialogProps {
    open: boolean;
    contentsWithChildren: ContentViewWithChildren[];
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
                    <mark key={i} className="text-[#0077BF] font-semibold bg-transparent">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

interface SearchResult {
    id: string;
    title: string;
    readme?: string;
    parentPath?: {
        title: string;
        id: string;
    }[];
}

export const SearchDialog = ({ open, onOpenChange, onContentSelect, contentsWithChildren }: SearchDialogProps) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 200);

    const filteredResults = useMemo(() => {
        if (!debouncedSearchTerm) return [];

        const searchTermLower = debouncedSearchTerm.toLowerCase();
        const results: SearchResult[] = [];

        const processContent = (content: ContentViewWithChildren, parents: { title: string; id: string }[] = []) => {
            if (
                content.title?.toLowerCase().includes(searchTermLower) ||
                content.readme?.toLowerCase().includes(searchTermLower)
            ) {
                results.push({
                    id: content.id,
                    title: content.title || '',
                    readme: content.readme,
                    parentPath: parents.length > 0 ? parents : undefined,
                });
            }

            content.children?.forEach(child => {
                processContent(child, [...parents, { title: content.title || '', id: content.id }]);
            });
        };

        contentsWithChildren.forEach(content => {
            processContent(content);
        });

        return results;
    }, [contentsWithChildren, debouncedSearchTerm]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle></DialogTitle>
            <DialogContent className="max-w-[580px] p-0">
                <div className="flex flex-col max-h-[760px] h-[760px] p-3 pb-0">
                    <div className="flex items-center gap-[6px]">
                        <DialogClose asChild>
                            <button className="text-text-800">
                                <ChevronLeft />
                            </button>
                        </DialogClose>
                        <div className="w-full h-[37px] bg-input p-2 rounded-[6px] flex items-center">
                            <Search className="h-4 w-4 text-text" />
                            <Input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border-none text-text"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="w-5 h-5 rounded-full bg-[#dfe0e2] flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="flex-grow mt-[18px]">
                        <div className="space-y-1">
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
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1">
                                            <h3 className="text-text">
                                                <HighlightedText
                                                    text={result.title || t('search.newPage')}
                                                    searchTerm={debouncedSearchTerm}
                                                />
                                            </h3>
                                            {result.parentPath && (
                                                <span className="text-xs text-dim whitespace-nowrap">
                                                    {result.parentPath.map((parent, index) => (
                                                        <span key={parent.id}>
                                                            {index > 0 && ' / '}
                                                            <HighlightedText
                                                                text={parent.title}
                                                                searchTerm={debouncedSearchTerm}
                                                            />
                                                        </span>
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredResults.length === 0 && debouncedSearchTerm && (
                                <p className="text-center text-dim py-[50px]">{t('search.noResults')}</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
