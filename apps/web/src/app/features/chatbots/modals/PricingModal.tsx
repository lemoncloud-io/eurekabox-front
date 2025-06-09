import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@eurekabox/lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';
import { cn } from '@eurekabox/lib/utils';

export const PricingModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'billing' | 'conversation'>('billing');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <DialogHeader>
                    <DialogTitle>{t('pricing.title')}</DialogTitle>
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
                            {t('pricing.tabs.billing')}
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
                            {t('pricing.tabs.conversation')}
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
                                        <div className="text-text-700">{t('pricing.billing.agent_model')}</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.billing.base_fee')}</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.billing.realtime_fee')}</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.billing.realtime_token_usage')}</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.billing.cumulative_fee')}</div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="text-text-700">
                                            {t('pricing.billing.cumulative_token_usage')}
                                        </div>
                                        <div className="text-[17px] font-medium">Got-4o-turbo</div>
                                    </li>
                                </ul>
                                <div className="w-full h-[1px] bg-[#F0F0F0] dark:bg-[#53555B] my-[10px]"></div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[17px] font-medium">{t('pricing.billing.total_cost')}</div>
                                    <div className="text-[15px] font-medium text-[#0057FF]">$15.45</div>
                                </div>
                            </>
                        )}
                        {activeTab === 'conversation' && (
                            <ul className="flex flex-col space-y-[6px] max-h-[314px] overflow-auto">
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.question_name')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.token_usage')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.billing_fee')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                </li>
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.question_name')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.token_usage')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.billing_fee')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                </li>
                                <li className="py-[9px] px-[11px] bg-[#F4F5F5] dark:bg-[#222325] rounded-[14px] flex flex-col gap-[3px]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.question_name')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.token_usage')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-text-700">{t('pricing.conversation.billing_fee')}</div>
                                        <div className="font-medium">
                                            {t('pricing.conversation.question_title_display')}
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-[18px] pb-6 mt-auto">
                    <Button size="lg" onClick={() => onOpenChange(false)}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
