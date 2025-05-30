import { useState } from 'react';

import { Button } from '@eurekabox/lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';
import { cn } from '@eurekabox/lib/utils';

export const PricingModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) => {
    const [activeTab, setActiveTab] = useState<'billing' | 'conversation'>('billing');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <DialogHeader>
                    <DialogTitle>비용 안내</DialogTitle>
                </DialogHeader>
                <div className="px-[18px]">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={cn(
                                'relative pb-[2px] text-base font-medium transition-colors duration-200',
                                activeTab === 'billing' ? 'text-text-800' : 'text-[#787878]'
                            )}
                        >
                            청구 비용
                            {activeTab === 'billing' && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('conversation')}
                            className={cn(
                                'relative pb-[2px] text-base font-medium transition-colors duration-200',
                                activeTab === 'conversation' ? 'text-text-800' : 'text-[#787878]'
                            )}
                        >
                            대화별 비용
                            {activeTab === 'conversation' && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3px] w-[18px] h-[2px] bg-text-800 rounded-[100px]" />
                            )}
                        </button>
                    </div>
                    <div className="mt-[21px]">
                        {activeTab === 'billing' && (
                            <>
                                <ul className="flex flex-col space-y-[6.5px]">
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">에이전트 모델</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">기본 요금</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">실시간 요금</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">실시간 토큰 사용량</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">누적 요금</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">누적 토큰 사용량</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                </ul>
                                <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[10px]"></div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[17px] font-medium">총 합계 비용</div>
                                    <div className="text-[15px] font-medium text-[#0057FF]">$15.45</div>
                                </div>
                            </>
                        )}
                        {activeTab === 'conversation' && (
                            <ul className="flex flex-col space-y-[6px] max-h-[314px] overflow-auto">
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">질문명</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">사용 토큰</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">청구 비용</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                </li>
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">질문명</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">사용 토큰</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">청구 비용</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                </li>
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">질문명</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">사용 토큰</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">청구 비용</div>
                                        <div className="font-medium">질문 타이틀 노출</div>
                                    </div>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-[18px] pb-6 mt-auto">
                    <Button size="lg">확인</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
