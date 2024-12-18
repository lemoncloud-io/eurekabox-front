import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@lemonote/lib/components/ui/tooltip';
import { Switch } from '@lemonote/lib/components/ui/switch';

interface AutoSaveToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const AutoSaveToggle = ({ checked, onCheckedChange }: AutoSaveToggleProps) => {
    return (
        <div className="fixed top-20 right-10 z-50 flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">자동 저장</span>
                            <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label="자동 저장 토글" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>마지막 변경 후 3초가 지나면 자동 저장</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
