import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import type { ChatStrategy, ChatView, RagChatBody } from '@lemoncloud/ssocio-chatbots-api';

import { chatKeys, useChat, useChildChats, useDeleteChat, useSendMessage } from '@eurekabox/chatbots';
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

import { ChatCard, ChatInput, ChatbotSettings, ModelSelectionDialog, PromptSettings } from '../components';

const SCROLL_THROTTLE_MS = 16; // 60fps

export const ChatPage = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<ChatStrategy>('md1');

    const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [areChatsReady, setAreChatsReady] = useState(false);

    const { setIsLoading } = useGlobalLoader();
    const deleteChat = useDeleteChat();

    const { data: selectedChat } = useChat(id || '');
    const { data: childChatsData, isLoading, error, refetch } = useChildChats({ rootId: id, limit: 20 });

    useEffect(() => {
        setIsLoading(isLoading);
        if (error) {
            toast({ title: '채팅 목록을 불러오는데 실패했습니다.' });
        }
    }, [isLoading, error, setIsLoading]);

    useEffect(() => {
        const isEmptyArray = childChatsData?.data?.length === 0;
        const hasOnlyEmptyObjects = childChatsData?.data?.every(item => !Object.keys(item).length);

        if (isEmptyArray || hasOnlyEmptyObjects) {
            setDialogOpen(true);
        }
        setAreChatsReady(false);

        scrollRefs.current = new Array(childChatsData?.data?.length).fill(null);

        // Add a small delay to allow chat windows to render
        const timer = setTimeout(() => {
            const allLoaded = scrollRefs.current.every(ref => {
                if (!ref) {
                    return false;
                }
                const scrollContainer = ref.querySelector('.overflow-y-auto');
                return scrollContainer && scrollContainer.scrollHeight > 0;
            });
            setAreChatsReady(allLoaded);
        }, 100);

        return () => {
            clearTimeout(timer);
            scrollRefs.current = [];
            setAreChatsReady(false);
        };
    }, [childChatsData, id]);

    const sendMessage = useSendMessage();

    const [inputValue, setInputValue] = useState('');

    const getGridColumns = (modelCount: number) => {
        switch (modelCount) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-2';
            case 3:
                return 'grid-cols-3';
            case 4:
                return 'grid-cols-2 lg:grid-cols-4';
            case 5:
            case 6:
                return 'grid-cols-2 lg:grid-cols-3';
            default:
                return 'grid-cols-2 lg:grid-cols-4';
        }
    };

    const getCardHeight = (modelCount: number) => {
        if (modelCount <= 2) {
            return 'h-[calc(100vh-271px)]';
        }
        if (modelCount <= 4) {
            return 'h-[566px]';
        }
        return 'h-[566px]';
    };

    const updateChatMessages = async (chatId: string, newMessages: ChatView[]) => {
        await queryClient.setQueryData(chatKeys.list({ rootId: chatId, limit: -1 }), (oldData: any) => {
            if (!oldData) {
                return oldData;
            }

            const newFirstPage = {
                ...oldData.pages[0],
                data: [...(oldData.pages[0].data || []), ...newMessages],
            };
            return {
                ...oldData,
                pages: [newFirstPage, ...oldData.pages.slice(1)],
                pageParams: oldData.pageParams,
            };
        });
    };

    const handleMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) {
            return;
        }

        try {
            const body: RagChatBody = {
                input: inputValue,
                sid: selectedChat?.sid || selectedChat?.profile$?.sid,
            };
            // Initialize sending states for all chats
            const initialStates = childChatsData?.data.reduce((acc, chat) => {
                acc[chat.id] = true;
                return acc;
            }, {} as Record<string, boolean>);
            setSendingStates(initialStates || {});

            // Send message to all chats in parallel
            await Promise.all(
                childChatsData?.data.map(async chat => {
                    try {
                        const res = await sendMessage.mutateAsync({
                            groupId: chat.id as string,
                            params: {
                                strategy: selectedStrategy,
                            },
                            body,
                        });

                        await updateChatMessages(chat.id, res.list || []);
                    } catch (error: any) {
                        const errorResponse = error?.response?.data;
                        if (errorResponse?.list) {
                            await updateChatMessages(chat.id, errorResponse.list);
                        }
                    } finally {
                        setSendingStates(prev => ({ ...prev, [chat.id]: false }));
                    }
                }) || []
            );

            setInputValue('');
        } catch (error) {
            console.error('Failed to send messages:', error);
            toast({ title: 'Failed to send messages' });
        }
    };

    // Add new state and refs for scroll syncing
    const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isScrolling = useRef(false);
    const lastScrollTime = useRef(0);

    const updateScrollRef = useCallback(
        (el: HTMLDivElement | null, index: number) => {
            if (scrollRefs.current.length !== childChatsData?.data?.length) {
                scrollRefs.current = new Array(childChatsData?.data?.length).fill(null);
            }
            scrollRefs.current[index] = el;

            // Check if all refs are set
            const allRefsSet = scrollRefs.current.every(
                (ref, idx) => idx >= (childChatsData?.data?.length || 0) || ref !== null
            );
            setAreChatsReady(allRefsSet);
        },
        [childChatsData?.data?.length]
    );

    // Handle scroll sync
    const handleScroll = useCallback(
        (index: number, event: React.UIEvent<HTMLDivElement>) => {
            const now = Date.now();
            if (isScrolling.current || now - lastScrollTime.current < SCROLL_THROTTLE_MS || !areChatsReady) {
                return;
            }

            const target = event.target as HTMLDivElement;
            const scrollRatio = target.scrollTop / (target.scrollHeight - target.clientHeight);

            isScrolling.current = true;
            lastScrollTime.current = now;

            scrollRefs.current.forEach((cardRef, i) => {
                if (i !== index && cardRef) {
                    const scrollContainer = cardRef.querySelector('.overflow-y-auto');
                    if (scrollContainer) {
                        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                        scrollContainer.scrollTop = scrollHeight * scrollRatio;
                    }
                }
            });

            isScrolling.current = false;
        },
        [areChatsReady]
    );

    const isAnySending = Object.values(sendingStates).some(state => state);

    const handleDeleteClick = (chatId: string) => {
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
                    await queryClient.invalidateQueries(chatKeys.list({ rootId: id }));
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

    return (
        <>
            <div className="flex-1 bg-background">
                <div className="bg-background p-4">
                    {error ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-bold">데이터를 불러오는데 실패했습니다</h2>
                                <Button onClick={() => refetch()} variant="outline">
                                    다시 시도
                                </Button>
                            </div>
                        </div>
                    ) : id ? (
                        <>
                            <div className="mb-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold">{selectedChat?.name || 'AI'} 메세지 비교</h1>
                                        <p className="text-muted-foreground">
                                            {childChatsData?.data?.length}개의 AI 응답을 비교해보세요
                                        </p>
                                    </div>
                                    <div className="w-[200px]">
                                        <PromptSettings />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 pb-[116px] overflow-auto">
                                {childChatsData?.data.map((chat, index) => (
                                    <ChatCard
                                        key={`chat_card_${chat.id}_${index}`}
                                        chat={chat}
                                        index={index}
                                        isSending={sendingStates[chat.id]}
                                        onDelete={handleDeleteClick}
                                        onScroll={handleScroll}
                                        scrollRef={el => updateScrollRef(el, index)}
                                        cardHeight={getCardHeight(childChatsData?.data?.length)}
                                    />
                                ))}
                            </div>

                            <footer className="h-[116px] flex items-center justify-center fixed bottom-0 right-0 left-0 border-t border-[#BABCC0] dark:border-[#787878] bg-white dark:bg-[#1C1C1D]">
                                <ChatbotSettings
                                    selectedStrategy={selectedStrategy}
                                    setSelectedStrategy={setSelectedStrategy}
                                />
                                <div className="w-[600px]">
                                    <ChatInput
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onSubmit={handleMessageSubmit}
                                        isDisabled={isAnySending}
                                        isLoading={isAnySending}
                                    />
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-bold">채팅을 선택해주세요</h2>
                                <p className="text-muted-foreground">
                                    왼쪽 사이드바에서 기존 채팅을 선택하거나
                                    <br />
                                    새로운 채팅을 만들어주세요
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ModelSelectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                forceOpen={childChatsData?.data?.length === 0}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogTitle>채팅 삭제</AlertDialogTitle>
                    <AlertDialogDescription>정말로 이 채팅을 삭제하시겠습니까?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" onClick={() => setIsDeleteDialogOpen(false)}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
