import { X } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@eurekabox/lib/components/ui/dialog';

import { DUMMY_MODELS } from '../data/dummyData';

interface NewChatModalProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onNewChat: () => void;
}

export const NewChatModal = ({ open, onOpenChange, onNewChat }: NewChatModalProps) => {
    const handleModelSelect = () => {
        onNewChat();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] p-0 !rounded-[22px] gap-0 overflow-hidden text-text">
                <DialogHeader className="sticky top-0 flex-row items-center justify-between pt-[14px] px-3 pb-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] bg-popup">
                    <DialogTitle className="text-base flex-1 text-center pl-6">채팅 모델 선택</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <DialogClose className="!m-0">
                        <X />
                    </DialogClose>
                </DialogHeader>
                <ul className="p-[18px] flex flex-col space-y-[10px] max-h-[600px] overflow-auto">
                    {DUMMY_MODELS.map(model => (
                        <li
                            key={model.id}
                            className={`dark:bg-[#02060E] border ${
                                model.isActive
                                    ? 'border-[1.5px] border-black dark:border-[#BABCC0]'
                                    : 'border-[#babcc0] dark:border-[#787878]'
                            } rounded-lg py-[10px] px-[14px] flex items-start justify-between hover:border-black hover:dark:border-[#BABCC0] cursor-pointer`}
                            onClick={handleModelSelect}
                        >
                            <div>
                                <div className="text-text-800">
                                    <span className="text-base text-text-700 font-medium ml-1">{model.name}</span>(
                                    {model.description})
                                </div>
                                <div className="text-dim">
                                    input ${model.pricing.input} / Cached input ${model.pricing.cachedInput} / Output $
                                    {model.pricing.output}
                                </div>
                            </div>
                            {model.isActive && <div className="text-[#0057FF] font-medium">이용중</div>}
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-center gap-2 pt-7 pb-6 mt-auto">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-[182px] h-[46px] text-[18px]">
                            취소
                        </Button>
                    </DialogClose>
                    <Button className="w-[182px] h-[46px] text-[18px]" onClick={handleModelSelect}>
                        저장
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
