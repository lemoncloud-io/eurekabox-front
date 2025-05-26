import { Check, X } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@eurekabox/lib/components/ui/dialog';

export const TestChatSelectModal = ({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-full max-w-[500px] p-0 !rounded-[22px] gap-0 overflow-hidden text-text">
                <DialogHeader className="sticky top-0 flex-row items-center justify-between pt-[14px] px-3 pb-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] bg-popup">
                    <DialogTitle className="text-base flex-1 text-center pl-6">테스트 모델 조합 선택</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <DialogClose className="!m-0">
                        <X />
                    </DialogClose>
                </DialogHeader>
                <div className="p-[18px] overflow-auto">
                    <div className="text-[18px] font-medium mb-7">
                        에이전트를 직접 조합한 후에
                        <br />
                        채팅 테스트를 진행해 보세요
                    </div>

                    <div className="text-base font-medium mb-[2px]">임베딩 모델</div>
                    <div className="text-xs text-text-700">
                        컴퓨터가 이해할 수 있도록 데이터를 숫자로
                        <br />
                        이루어진 배열로 바꾸는 모델
                    </div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                        {/* 선택된 버튼 */}
                        <button className="flex items-center justify-between h-[41px] border border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div>Text-embedding-3-small</div>
                            <Check className="w-[18px] h-[18px] text-[#8F19F6]" />
                        </button>
                    </div>
                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>
                    <div className="text-base font-medium mb-[2px]">시스템 프롬프트</div>
                    <div className="text-xs text-text-700">AI 행동 방식, 말투, 역할과 같은 페르소나</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        <button className="flex items-center justify-between h-[41px] border border-[#3A3C40] dark:border-[#BABCC0] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div>Text-embedding-3-small</div>
                            <Check className="w-[18px] h-[18px] text-[#8F19F6]" />
                        </button>
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                    </div>
                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>
                    <div className="text-base font-medium mb-[2px]">채팅 모델</div>
                    <div className="text-xs text-text-700">인공지능 모델</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                    </div>
                    <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[18px]"></div>
                    <div className="text-base font-medium mb-[2px]">사용자 프롬프트</div>
                    <div className="text-xs text-text-700">사용자의 질문과 관련 문서를 포함하여 AI에게 요청</div>
                    <div className="mt-[10px] flex flex-col space-y-[6px]">
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                        <button className="h-[41px] border border-[#babcc0] dark:border-[#787878] dark:bg-[#222325] rounded-lg py-[10px] px-[14px] text-left hover:border-[#3A3C40] hover:dark:border-[#BABCC0]">
                            <div className="text-[#84888F]">Text-embedding-3-small</div>
                        </button>
                    </div>
                </div>

                <div className="pb-4 pt-[10px] px-4 bg-popup border-t border-[#BABCC0] dark:border-[#53555B]">
                    <div className="text-text-800 pb-[19px] pt-[18px] text-center">
                        선택된 조합이 없습니다.
                        <br />위 4가지 유형에서 조합할 항목을 선택해주세요.
                    </div>
                    <div>
                        <div className="font-medium mb-[10px]">선택된 조합 (4)</div>
                        <div className="flex flex-col space-y-1 overflow-auto max-h-[140px]">
                            <div className="bg-[#F4F5F5] dark:bg-[#222325] py-[10px] px-[14px] text-xs rounded-lg">
                                <div>・ Text-embedding-3-small</div>
                                <div>・ gpt-4o-mini</div>
                                <div>・ 페르소나1</div>
                                <div>・ 사용자 프롬프트1</div>
                            </div>
                            <div className="bg-[#F4F5F5] dark:bg-[#222325] py-[10px] px-[14px] text-xs rounded-lg">
                                <div>・ Text-embedding-3-small</div>
                                <div>・ gpt-4o-mini</div>
                                <div>・ 페르소나1</div>
                                <div>・ 사용자 프롬프트1</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-[9px]">
                        <DialogClose className="!m-0">
                            <Button variant="outline" className="w-[182px] h-[46px] text-[18px]">
                                취소
                            </Button>
                        </DialogClose>
                        <Button className="w-[182px] h-[46px] text-[18px]" disabled>
                            생성
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
