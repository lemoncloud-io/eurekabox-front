import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MessageSquare, Plus, Trash2 } from 'lucide-react';

import { createAsyncDelay } from '@lemoncloud/lemon-web-core';
import type { ChatUserProfile, ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { rootChatbotsKeys, useCreateRootChat, useDeleteChat, useRootChats } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from '@eurekabox/ui-kit/components/ui/alert-dialog';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@eurekabox/ui-kit/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import { Input } from '@eurekabox/ui-kit/components/ui/input';
import { Label } from '@eurekabox/ui-kit/components/ui/label';
import { useWebCoreStore } from '@eurekabox/web-core';

import { usePagination } from '../../../shared';




export const RootChats = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setIsLoading } = useGlobalLoader();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { profile } = useWebCoreStore();

    const [isOpen, setIsOpen] = useState(false);
    const [newChatName, setNewChatName] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = 10;
    const queryParams = {
        page,
        limit,
    };

    const createRootChat = useCreateRootChat();
    const deleteChat = useDeleteChat();
    const { data: rootChatsData, isLoading, error, refetch } = useRootChats(queryParams);

    useEffect(() => {
        setIsLoading(isLoading);
        if (error) {
            toast({ title: '채팅 목록을 불러오는데 실패했습니다.' });
        }
    }, [isLoading, error, setIsLoading]);

    const { paginationRange } = usePagination({
        totalCount: rootChatsData?.total || 0,
        pageSize: limit,
        currentPage: page,
        siblingCount: 1,
    });

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleChatSelect = (chatId: string) => {
        navigate(`/ai/chat/${chatId}`);
    };

    const handleCreateChat = async () => {
        try {
            setIsLoading(true);
            const profile$: ChatUserProfile = {
                ...(profile?.sid && { sid: profile.sid }),
                ...(profile?.uid && { uid: profile.uid }),
                ...(profile?.$user?.gender && { gender: profile?.$user?.gender }),
                ...(profile?.$user?.name && { name: profile?.$user?.name }),
            };

            await createRootChat.mutateAsync(
                { name: newChatName, profile$ },
                {
                    onSuccess: async (newChat: ChatView) => {
                        await createAsyncDelay(1000);
                        await queryClient.invalidateQueries(rootChatbotsKeys.invalidateList());
                        setNewChatName('');
                        setIsOpen(false);
                        toast({ title: '새로운 채팅이 생성되었습니다.' });
                        navigate(`/ai/chat/${newChat.id}`);
                    },
                }
            );
        } catch (error) {
            console.error('Failed to create chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatToDelete(chatId);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!chatToDelete) {
            return;
        }

        try {
            setIsLoading(true);
            await deleteChat.mutateAsync(chatToDelete, {
                onSuccess: async () => {
                    setIsDeleteDialogOpen(false);
                    await createAsyncDelay(500);
                    await queryClient.invalidateQueries(rootChatbotsKeys.invalidateList());
                    navigate(-1);
                    toast({ title: '채팅이 삭제되었습니다.' });
                },
            });
        } catch (error) {
            console.error('Failed to delete chat:', error);
            toast({ title: '채팅 삭제에 실패했습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <Card className="fixed w-60 p-0 rounded-none shadow-none flex flex-col h-[calc(100%-50px)] border-r border-[#EAEAEC] dark:border-[#3A3C40]">
                <CardHeader>
                    <CardTitle className="font-medium flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        채팅 리스트
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-red-500">Failed to load chats. Please try again.</div>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="fixed w-60 p-0 rounded-none shadow-none flex flex-col h-[calc(100%-50px)] border-r border-[#EAEAEC] dark:border-[#3A3C40]">
                <CardHeader>
                    <CardTitle className="font-medium flex items-center justify-between">
                        <div className="flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            채팅 리스트
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setIsOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col overflow-auto">
                    <div className="h-full space-y-1 p-2 flex-1 flex flex-col">
                        {isLoading ? (
                            <div className="p-4 text-center">Loading...</div>
                        ) : rootChatsData?.data?.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No chats found</div>
                        ) : (
                            <>
                                <div className="flex-1 space-y-1 overflow-auto">
                                    {rootChatsData?.data?.map(chat => (
                                        <div key={chat.id} className="flex items-center gap-2">
                                            <Button
                                                variant={chat.id === id ? 'default' : 'ghost'}
                                                className="w-full justify-start text-sm h-9"
                                                onClick={() => handleChatSelect(chat.id)}
                                            >
                                                {chat.name || 'Untitled Chat'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-2 hover:text-danger"
                                                onClick={e => handleDeleteClick(chat.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center space-x-2 p-4 mt-auto pb-[100px]">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {paginationRange.map((pageNumber, idx) => (
                                        <Button
                                            key={idx}
                                            variant={pageNumber === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() =>
                                                typeof pageNumber === 'number' && handlePageChange(pageNumber)
                                            }
                                            disabled={typeof pageNumber !== 'number'}
                                        >
                                            {typeof pageNumber === 'number' ? pageNumber + 1 : '...'}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= Math.ceil((rootChatsData?.total || 0) / limit) - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={isOpen}
                onOpenChange={open => {
                    setNewChatName('');
                    setIsOpen(open);
                }}
            >
                <DialogContent>
                    <DialogTitle className="text-center">새로운 채팅 만들기</DialogTitle>
                    <div className="px-6 pt-6">
                        <div>
                            <Label>채팅방 이름</Label>
                            <Input
                                placeholder="채팅방 이름을 입력하세요"
                                value={newChatName}
                                onChange={e => setNewChatName(e.target.value)}
                            />
                        </div>
                        <div className="mt-10 flex items-center gap-2 justify-center">
                            <Button
                                className="flex-1"
                                variant="outline"
                                onClick={() => {
                                    setNewChatName('');
                                    setIsOpen(false);
                                }}
                                disabled={createRootChat.isPending}
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleCreateChat}
                                disabled={!newChatName.trim() || createRootChat.isPending}
                                className="w-full"
                            >
                                {createRootChat.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    </div>
                                ) : (
                                    '생성'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogTitle>채팅 삭제</AlertDialogTitle>
                    <AlertDialogDescription>정말로 이 채팅을 삭제하시겠습니까?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteChat.isPending}
                        >
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction type="button" onClick={handleConfirmDelete} disabled={deleteChat.isPending}>
                            {deleteChat.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            ) : (
                                '삭제'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
