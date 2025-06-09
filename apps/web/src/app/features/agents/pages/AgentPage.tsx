import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Loader2 } from 'lucide-react';

import { useAgent, useAgents } from '@eurekabox/agents';

import { usePagination } from '../../../shared';
import { AgentForm, AgentList } from '../components';

export const AgentPage = () => {
    const { t } = useTranslation();
    const { id: agentId } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const isCreateMode = searchParams.get('mode') === 'create';
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = 10;

    const { data: agentsData, isLoading: isAgentsLoading } = useAgents({
        // search: searchQuery,
        page,
        limit,
    });
    const { data: selectedAgent, isLoading: isAgentLoading } = useAgent(agentId || '');

    const { paginationRange } = usePagination({
        totalCount: agentsData?.total || 0,
        pageSize: limit,
        currentPage: page,
        siblingCount: 1,
    });

    const isFormVisible = Boolean(agentId) || isCreateMode;
    const formMode = agentId ? 'edit' : 'create';

    const handleAgentSelect = (selectedAgentId: string) => {
        const currentParams = new URLSearchParams(searchParams);
        navigate(`/agents/${selectedAgentId}?${currentParams.toString()}`);
    };

    const handleCreateNew = () => {
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set('mode', 'create');
        navigate(`/agents?${currentParams.toString()}`);
    };

    const handleFormSuccess = (newAgentId: string) => {
        if (isCreateMode) {
            const currentParams = new URLSearchParams(searchParams);
            currentParams.delete('mode'); // create 모드는 제거
            navigate(`/agents/${newAgentId}?${currentParams.toString()}`);
        }
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleSearchChange = (query: string) => {
        setSearchParams(prev => {
            if (query) {
                prev.set('search', query);
            } else {
                prev.delete('search');
            }
            prev.set('page', '0');
            return prev;
        });
    };

    return (
        <div className="bg-background p-4">
            <div className="grid grid-cols-[1fr_2fr] max-md:grid-cols-1 gap-6 max-w-[1500px] w-full">
                <AgentList
                    agents={agentsData?.data || []}
                    isLoading={isAgentsLoading}
                    selectedAgentId={agentId || null}
                    searchQuery={searchQuery}
                    onAgentSelect={handleAgentSelect}
                    onCreateNew={handleCreateNew}
                    onSearchChange={handleSearchChange}
                    currentPage={page}
                    totalCount={agentsData?.total || 0}
                    pageSize={limit}
                    paginationRange={paginationRange}
                    onPageChange={handlePageChange}
                />

                {isFormVisible ? (
                    isAgentLoading && agentId ? (
                        <div className="flex items-center gap-2 w-full h-full justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    ) : (
                        <AgentForm
                            key={`${formMode}-${agentId || 'new'}`}
                            mode={formMode}
                            agentId={agentId || null}
                            agentData={selectedAgent || null}
                            onFormSuccess={handleFormSuccess}
                        />
                    )
                ) : (
                    <div className="h-[calc(100vh-140px)] bg-white dark:bg-[#1C1C1D] shadow-[0_0_10px_rgba(0,0,0,0.06)] border border-chatbot-line rounded-[16px] flex items-center justify-center">
                        <div className="text-center text-[#9FA2A7]">
                            <div className="text-lg font-medium mb-2">{t('agent.page.emptyState.title')}</div>
                            <div className="text-sm">{t('agent.page.emptyState.description')}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
