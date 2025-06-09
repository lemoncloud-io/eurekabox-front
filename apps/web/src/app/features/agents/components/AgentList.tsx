import { useTranslation } from 'react-i18next';

import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';

import type { AgentView } from '@lemoncloud/ssocio-chatbots-api';

import { Button } from '@eurekabox/ui-kit/components/ui/button';

import { AgentListItem } from './AgentListItem';

interface AgentListProps {
    agents: AgentView[];
    isLoading: boolean;
    selectedAgentId: string | null;
    searchQuery: string;
    onAgentSelect: (agentId: string) => void;
    onCreateNew: () => void;
    onSearchChange: (query: string) => void;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    paginationRange: (number | string)[];
    onPageChange: (page: number) => void;
}

export const AgentList = ({
    agents,
    isLoading,
    selectedAgentId,
    searchQuery,
    onAgentSelect,
    onCreateNew,
    onSearchChange,
    currentPage,
    totalCount,
    pageSize,
    paginationRange,
    onPageChange,
}: AgentListProps) => {
    const { t } = useTranslation();
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="h-[calc(100vh-140px)] bg-white dark:bg-[#1C1C1D] shadow-[0_0_10px_rgba(0,0,0,0.06)] border border-chatbot-line rounded-[16px] overflow-hidden flex flex-col">
            {/* TODO: add search */}
            {/*<div className="mb-4 p-4 pb-0">*/}
            {/*    <div className="h-[29px] bg-white dark:bg-[#1C1C1D] shadow-[0_0_10px_rgba(0,0,0,0.06)] border border-chatbot-line flex items-center justify-between gap-[10px] rounded-md py-[6px] pr-2 pl-[7px] w-[178px]">*/}
            {/*        <input*/}
            {/*            placeholder={t('agent.list.search.placeholder')}*/}
            {/*            value={searchQuery}*/}
            {/*            onChange={e => onSearchChange(e.target.value)}*/}
            {/*            className="flex-1 w-full bg-white dark:bg-[#1C1C1D] outline-0 text-xs"*/}
            {/*        />*/}
            {/*        <Search className="w-4 h-4 text-text-400" />*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* 헤더 */}
            <div className="flex items-center justify-between p-5">
                <div className="font-medium">{t('agent.list.header')}</div>
                <Button
                    variant="outline"
                    className="border-point gap-1 rounded-[6px] py-1 pr-2 pl-[6px] text-xs h-[26px]"
                    onClick={onCreateNew}
                >
                    <Plus className="w-[18px] h-[18px]" /> {t('agent.list.actions.addAgent')}
                </Button>
            </div>

            {/* 목록 */}
            <div className="px-4 flex-1 mt-2 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                ) : agents.length > 0 ? (
                    <ul className="space-y-2">
                        {agents.map(agent => (
                            <AgentListItem
                                key={agent.id}
                                agent={agent}
                                isSelected={agent.id === selectedAgentId}
                                onSelect={() => onAgentSelect(agent.id)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-[#9FA2A7] flex items-center justify-center h-full">
                        {t('agent.list.states.empty')}
                    </div>
                )}
            </div>
            {totalCount > 0 && (
                <div className="flex items-center justify-center space-x-2 p-4 border-t border-chatbot-line">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {paginationRange.map((pageNumber, idx) => (
                        <Button
                            key={idx}
                            variant={pageNumber === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
                            disabled={typeof pageNumber !== 'number'}
                            className="h-8 min-w-8 px-2"
                        >
                            {typeof pageNumber === 'number' ? pageNumber + 1 : '...'}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
