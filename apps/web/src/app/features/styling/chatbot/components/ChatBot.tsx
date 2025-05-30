import { useRef, useState } from 'react';

import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Copy,
    Ellipsis,
    EllipsisVertical,
    Maximize2,
    MessageCircleWarning,
    MessageSquareText,
    Paperclip,
    PencilLine,
    SendHorizontal,
    ThumbsDown,
    ThumbsUp,
    X,
} from 'lucide-react';

import { Images } from '@eurekabox/assets';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@eurekabox/lib/components/ui/alert-dialog';
import { Button } from '@eurekabox/lib/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { cn } from '@eurekabox/lib/utils';
import { useTheme } from '@eurekabox/theme';

import { NewChatModal } from './NewChatModal';
import { PricingModal } from './PricingModal';
import { TestChatSelectModal } from './TestChatSelectModal';

export const ChatBot = () => {
    const { isDarkTheme } = useTheme();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [testChatSelectModalOpen, setTestChatSelectModalOpen] = useState(false);
    const [newChatModalOpen, setNewChatModalOpen] = useState(false);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');

    const openHelp = (tab: 'faq' | 'chat') => {
        setActiveTab(tab);
        setIsHelpOpen(true);
    };

    const handleInput = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    };

    return (
        <div className="text-text flex gap-6">
            {/* 챗봇 질문/응답 */}
            <div className="w-[484px] min-h-[350px] max-h-[800px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
                <header className="py-[10px] px-3 flex items-center justify-between sticky top-0">
                    <div className="text-sm font-medium">Got-4o-mini</div>
                    <div className="flex items-center gap-[10px]">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-[2px] group">
                                    <EllipsisVertical className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[100px] px-3 bg-chatbot-card">
                                <DropdownMenuItem className="text-xs" onClick={() => setNewChatModalOpen(true)}>
                                    새채팅 모달
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                                <DropdownMenuItem onClick={() => setTestChatSelectModalOpen(true)} className="text-xs">
                                    채팅 테스트
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                                <DropdownMenuItem onClick={() => setPricingModalOpen(true)} className="text-xs">
                                    비용 안내
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" className="h-auto p-[2px] group">
                            <X className="w-[18px] h-[18px] text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                    </div>
                    <NewChatModal open={newChatModalOpen} onOpenChange={setNewChatModalOpen} />
                    <TestChatSelectModal open={testChatSelectModalOpen} onOpenChange={setTestChatSelectModalOpen} />
                    <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
                </header>

                <main className="px-4 w-full overflow-auto flex-1">
                    <div className="py-[10px]">
                        <img
                            src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                            alt="chatbot image"
                            className="w-9 h-9"
                        />
                        <div className="text-base font-medium mt-[3px]">무엇을 도와드릴까요?</div>
                    </div>

                    {/* 사용자 질문 */}
                    <div className="pt-[10px] pb-[14px] flex flex-col items-end justify-end">
                        <div className="w-[160px] h-auto overflow-hidden rounded-[10px] border border-[#DFE0E2] dark:border-[#53555B] mb-3 cursor-pointer">
                            <img
                                className="object-cover"
                                src="https://images.unsplash.com/photo-1745176593885-c1d466a6dff5?q=80&w=5002&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt=""
                            />
                        </div>
                        <div className="py-2 px-[14px] max-w-[292px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-tl-[18px] rounded-tr-[3px] rounded-br-[18px] rounded-bl-[18px]">
                            사용자 질문 영역
                        </div>
                    </div>

                    {/* AI 응답 */}
                    <div className="py-[10px] px-[14px] flex flex-col space-y-[9px]">
                        <div className="flex items-center gap-[9px]">
                            <img
                                src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                                alt="chatbot image"
                                className="w-6 h-6"
                            />
                            <div>ai 응답 메시지 영역</div>
                        </div>
                        <div>
                            <div
                                className="flex items-center gap-1 pl-[3px] mb-1 cursor-pointer"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <div className="text-[#007AFF] text-xs">관련문서</div>
                                <ChevronUp
                                    className={`text-[#007AFF] w-[13px] h-[13px] transform transition-transform duration-200 ${
                                        isOpen ? 'rotate-0' : 'rotate-180'
                                    }`}
                                />
                            </div>

                            {isOpen && (
                                <div className="py-[2px] px-[9px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-lg w-fit max-w-full">
                                    <ul className="flex flex-col space-y-[3px]">
                                        <li className="flex items-center gap-[3px] cursor-pointer text-text-800">
                                            <div className="text-xs  truncate hover:underline">
                                                문서 타이틀 선택 시 이동
                                            </div>
                                            <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                                        </li>
                                        <li className="flex items-center gap-[3px] cursor-pointer text-text-800">
                                            <div className="text-xs truncate  hover:underline">
                                                문서 타이틀 선택 시 이동
                                            </div>
                                            <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                                        </li>
                                        <li className="flex items-center gap-[3px] cursor-pointer text-text-800">
                                            <div className="text-xs truncate  hover:underline">
                                                문서 타이틀 선택 시 이동
                                            </div>
                                            <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-[6px]">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="p-[2px] h-auto group">
                                            <Copy className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-[#787878] p-1">
                                        <p className="dark:text-white">복사</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <button className="p-[2px]">
                                <ThumbsUp className="w-[14px] h-[14px] text-[#8F19F6]" />
                            </button>
                            <button className="p-[2px]">
                                <ThumbsDown className="w-[14px] h-[14px] text-[#9FA2A7]" />
                                <img src={Images.thumbsDown} alt="" />
                            </button>
                            <Button variant="ghost" className="p-[2px] h-auto group">
                                <PencilLine className="w-[14px] h-[14px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                            </Button>
                        </div>

                        {/* 응답 메세지 수정 결과 */}
                        <div className="max-w-[278px] min-h-[197px] rounded-xl border border-[#F4F5F5] dark:border-[#3A3C40] bg-white dark:bg-[#262626] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] py-3 px-4 flex flex-col">
                            <div className="flex items-center gap-[14px]  sticky top-0">
                                <Button variant="ghost" className="h-auto p-[2px] group">
                                    <Maximize2 className="w-[14px] h-[14px] text-[#84888F] group-hover:text-text transition-colors duration-200" />
                                </Button>
                                <div className="text-[13px] font-medium text-[#84888F]">질문 요약</div>
                            </div>
                            <div
                                className="mt-3 w-full line-clamp-[6] flex-1 text-text-700"
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            </div>
                            <div className="pt-1 mt-auto">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" className="h-auto p-[2px] group">
                                                <Copy className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="dark:bg-[#787878] p-1">
                                            <p className="dark:text-white">복사</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </main>

                <div className="w-full pt-[6px] px-4 mt-auto">
                    <div
                        className={cn(
                            'py-[6px] px-[10px] w-full border border-[#EAEAEC] dark:border-[#3A3C40] rounded-lg overflow-hidden transition-all duration-200 focus-within:border-[#7932FF] dark:focus-within:border-[#7932FF]',
                            isHelpOpen ? 'pb-[9px] rounded-b-none' : ''
                        )}
                    >
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="AI에게 무엇이든 물어보세요"
                            className="w-full max-h-[231px] overflow-auto resize-none outline-none bg-transparent"
                            onInput={handleInput}
                        />

                        <div className="flex items-center justify-between mt-[6px]">
                            <div className="flex items-center gap-[10px] ">
                                <Button
                                    variant="ghost"
                                    className="h-auto p-[2px] group"
                                    onClick={() => openHelp('faq')}
                                >
                                    <MessageCircleWarning className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-[2px] group"
                                    onClick={() => openHelp('chat')}
                                >
                                    <MessageSquareText className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                                <Button variant="ghost" className="h-auto p-[2px] group">
                                    <Paperclip className="w-4 h-4 text-[#9fa2a7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                            </div>
                            <button>
                                {/* 활성화 색상:#8F19F6 */}
                                <SendHorizontal className="w-[18px] h-[18px]" fill="#CFD0D3" stroke="#CFD0D3" />
                            </button>
                        </div>
                    </div>

                    {isHelpOpen && (
                        <div className="p-[6px] bg-[#F4F5F5] dark:bg-[#222325] border border-[#EAEAEC] dark:border-[#3A3C40] rounded-b-lg border-t-0">
                            <div className="flex items-center sticky top-0">
                                <Button
                                    variant="ghost"
                                    className="h-auto p-[2px] group"
                                    onClick={() => setIsHelpOpen(false)}
                                >
                                    <X className="w-[18px] h-[18px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                </Button>
                                <div className="flex ml-2 space-x-2">
                                    <button
                                        onClick={() => setActiveTab('faq')}
                                        className={cn(
                                            'relative px-2 pb-[2px] text-xs transition-colors duration-200',
                                            activeTab === 'faq' ? 'text-text-800' : 'text-[#BABCC0] dark:text-[#787878]'
                                        )}
                                    >
                                        자주 하는 질문
                                        {activeTab === 'faq' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className={cn(
                                            'relative px-2 pb-[2px] text-xs transition-colors duration-200',
                                            activeTab === 'chat'
                                                ? 'text-text-800'
                                                : 'text-[#BABCC0] dark:text-[#787878]'
                                        )}
                                    >
                                        채팅 내역
                                        {activeTab === 'chat' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-[228px] overflow-auto mt-[9px]">
                                {activeTab === 'faq' && (
                                    <ul className="flex flex-col space-y-[3px] px-[3px]">
                                        <li
                                            className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] line-clamp-2 max-h-10"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            자주 하는 질문 리스트 2줄 넘어갈 경우
                                        </li>
                                        <li
                                            className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] line-clamp-2 max-h-10"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리 자주 하는 질문 리스트 2줄
                                            넘어갈 경우 ... 처리 자주 하는 질문 리스트 2줄 넘어갈 경우 ... 처리 자주
                                            하는 질문 리스트 2줄 넘어갈 경우 ... 처리
                                        </li>
                                    </ul>
                                )}

                                {activeTab === 'chat' && (
                                    <>
                                        <ul className="flex flex-col space-y-[3px] px-[3px]">
                                            <li className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] max-h-10 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-[9px]">
                                                    <img
                                                        src={isDarkTheme ? Images.notice : Images.notice}
                                                        alt="notice icon"
                                                        className="w-[17px] h-[17px]"
                                                    />
                                                    <div
                                                        className="line-clamp-2 text-xs"
                                                        style={{
                                                            display: '-webkit-box',
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        질문 요약 들어가는 곳 리스트 2줄 넘어갈 경우 ... 처리 질문 요약
                                                        들어가는 곳 리스트 2줄 넘어갈 경우 ... 처리 질문 요약 들어가는
                                                        곳 리스트 2줄 넘어갈 경우 ... 처리 질문 요약 들어가는 곳 리스트
                                                        2줄 넘어갈 경우 ... 처리
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="p-[2px] h-auto group">
                                                            <Ellipsis className="text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-[100px] px-3 bg-chatbot-card"
                                                    >
                                                        <DropdownMenuItem className="text-xs">
                                                            고정해제
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-xs text-[#F34822]"
                                                                    onSelect={e => e.preventDefault()}
                                                                >
                                                                    삭제
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        채팅을 삭제하시겠습니까?
                                                                    </AlertDialogTitle>
                                                                </AlertDialogHeader>
                                                                <AlertDialogDescription className="text-center">
                                                                    삭제한 채팅은 복구가 불가합니다.
                                                                </AlertDialogDescription>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                                                    <AlertDialogAction>삭제</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </li>
                                        </ul>

                                        <div className="text-xs py-[9px]">최근</div>
                                        <ul className="flex flex-col space-y-[3px] px-[3px]">
                                            <li className="p-[6px] text-xs text-text-800 bg-white dark:bg-[#02060E] rounded-[5px] max-h-10 flex items-center justify-between gap-2">
                                                <div
                                                    className="line-clamp-2 text-xs"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    질문 요약 들어가는 곳 리스트 2줄 넘어갈 경우 ... 처리 질문 요약
                                                    들어가는 곳 리스트 2줄 넘어갈 경우 ... 처리 질문 요약 들어가는 곳
                                                    리스트 2줄 넘어갈 경우 ... 처리 질문 요약 들어가는 곳 리스트 2줄
                                                    넘어갈 경우 ... 처리
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="p-[2px] h-auto group">
                                                            <Ellipsis className="text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[100px] px-3">
                                                        <DropdownMenuItem className="text-xs">고정</DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                                                        <DropdownMenuItem className="text-xs text-[#F34822]">
                                                            삭제
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 질문 수정 */}
            <div className="w-[484px] min-h-[350px] max-h-[90vh] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
                <div className="py-[10px] px-3 flex items-center justify-between sticky top-0">
                    <div className="flex items-center gap-[6px]">
                        <Button variant="ghost" className="h-auto p-[2px] group">
                            <ChevronLeft className="w-[18px] h-[18px] text-[#9FA2A7] group-hover:text-text transition-colors duration-200" />
                        </Button>
                        <div className="font-medium truncate">채팅 질문 요약명으로 노출</div>
                    </div>
                    <Button size="sm" className="dark:bg-[#53009A]">
                        수정 완료
                    </Button>
                </div>
                <div className="py-[18px] px-[30px] bg-[#F4F5F5] dark:bg-[#2E2E2E] h-full">
                    AI 응답 메시지 수정 완료 AI 응답 메시지 수정 완료 AI 응답 메시지 수정 완료 AI 응답 메시지 수정 완료
                    AI 응답 메시지 수정 완료
                </div>
            </div>
        </div>
    );
};
