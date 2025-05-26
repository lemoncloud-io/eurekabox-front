import { useState } from 'react';

import { ChevronRight, ChevronUp, Copy, EllipsisVertical, Maximize2 } from 'lucide-react';

import { Images } from '@eurekabox/assets';
import { Button } from '@eurekabox/lib/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@eurekabox/lib/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { useTheme } from '@eurekabox/theme';

export const ChatBotTest = () => {
    const { isDarkTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="text-text">
            {/* 챗봇 질문/응답 */}
            <div className="max-h-[570px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] bg-chatbot-card border border-[#EAEAEC] dark:border-[#3A3C40] rounded-2xl flex flex-col overflow-hidden">
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
                                <DropdownMenuItem className="text-xs">모델 정보</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#F4F5F5] dark:bg-[#53555B] h-px mx-0 my-[2px]" />
                                <DropdownMenuItem className="text-xs text-[#F34822]">채팅 삭제</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
            </div>
        </div>
    );
};
