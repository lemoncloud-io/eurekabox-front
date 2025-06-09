import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, Loader2 } from 'lucide-react';

import type { AgentView } from '@lemoncloud/ssocio-chatbots-api';

import { useDeleteAgent } from '@eurekabox/agents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { updateAllListCaches } from '@eurekabox/shared';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@eurekabox/ui-kit/components/ui/alert-dialog';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@eurekabox/ui-kit/components/ui/dropdown-menu';

interface AgentListItemProps {
    agent: AgentView;
    isSelected: boolean;
    onSelect: () => void;
}

export const AgentListItem = ({ agent, isSelected, onSelect }: AgentListItemProps) => {
    const { t } = useTranslation();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const queryClient = useQueryClient();
    const deleteAgentMutation = useDeleteAgent();
    const navigate = useNavigate();

    const agentName = agent.meta$?.nick || agent.id || t('agent.listItem.states.noName');

    const handleDelete = async () => {
        try {
            await deleteAgentMutation.mutateAsync(agent.id);
            toast({
                title: t('agent.listItem.messages.deleteSuccess.title'),
                description: t('agent.listItem.messages.deleteSuccess.description', {
                    agentName: agent.meta$?.nick || agent.id,
                }),
            });
            updateAllListCaches({ resource: 'agents', queryClient }, (oldData: any) => {
                if (!oldData?.data) {
                    return oldData;
                }
                return {
                    ...oldData,
                    data: oldData.data.filter((item: any) => item.id !== agent.id),
                    list: oldData.list.filter((item: any) => item.id !== agent.id),
                    total: Math.max((oldData.total || 0) - 1, 0),
                };
            });
            navigate(-1);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('agent.listItem.messages.deleteError.title'),
                description: t('agent.listItem.messages.deleteError.description'),
            });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    const isDeleting = deleteAgentMutation.isPending;

    return (
        <>
            <li
                className={`relative border border-chatbot-line py-[9px] px-[13px] rounded-xl cursor-pointer hover:border-text transition-colors ${
                    isSelected ? 'bg-[#f4f5f5] dark:bg-[#222325]' : 'bg-white dark:bg-[#1C1C1D]'
                } ${isDeleting ? 'pointer-events-none' : ''}`}
                onClick={isDeleting ? undefined : onSelect}
                aria-busy={isDeleting}
            >
                {isDeleting && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-[#1C1C1D]/80 rounded-xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-sm text-text-700">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}
                <div className="text-base font-semibold flex items-center justify-between">
                    <span className=" overflow-hidden text-ellipsis">{agentName}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()} disabled={isDeleting}>
                            <Button variant="ghost" className="p-[2px] h-auto group" disabled={isDeleting}>
                                <EllipsisVertical className="w-4 h-4 text-text-800" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[100px] px-3 py-[6px] rounded-lg">
                            <DropdownMenuItem
                                className="text-xs text-[#F34822]"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowDeleteDialog(true);
                                }}
                                disabled={isDeleting}
                            >
                                {t('agent.listItem.actions.deleteMenuItem')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-text-700 text-xs overflow-hidden text-ellipsis">
                    {agent.meta$?.role || t('agent.listItem.states.noRole')}
                    <br />
                    {agent.meta$?.goal || t('agent.listItem.states.noGoal')}
                </div>
                <hr className="my-[10px] w-full h-[1px] bg-[#F0F0F0] dark:bg-white" />
                <div className="space-y-[10px]">
                    <div className="flex items-center justify-between font-medium">
                        <div>{t('agent.listItem.labels.embeddingModel')}</div>
                        <div className="text-[13px] text-text-700">
                            {agent.embedding$?.name || t('agent.listItem.states.notAvailable')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                        <div>{t('agent.listItem.labels.modelType')}</div>
                        <div className="text-[13px] text-text-700">
                            {agent.brain$?.name || t('agent.listItem.states.notAvailable')}
                        </div>
                    </div>
                </div>
            </li>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('agent.listItem.dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: t('agent.listItem.dialog.description', {
                                        agentName: agent.meta$?.nick || agent.id,
                                    }),
                                }}
                            />
                            <br />
                            {t('agent.listItem.dialog.warning')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            {t('agent.listItem.dialog.actions.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                t('agent.listItem.dialog.actions.delete')
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
