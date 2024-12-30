import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@eurekabox/lib/components/ui/tooltip';
import { Switch } from '@eurekabox/lib/components/ui/switch';
import { useLocalStorage } from '@eurekabox/shared';

interface AutoSaveToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const AutoSaveToggle = ({
    checked: externalChecked,
    onCheckedChange: externalOnChange,
}: AutoSaveToggleProps) => {
    const [internalChecked, setInternalChecked] = useLocalStorage('editor-autosave', true);

    const checked = externalChecked ?? internalChecked;
    const handleChange = (value: boolean) => {
        setInternalChecked(value);
        externalOnChange?.(value);
    };

    return (
        <TooltipProvider>
            <div className="fixed top-20 right-10 z-50 flex items-center gap-2 dark:bg-accent p-2 rounded-lg shadow-md border border-border">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">자동 저장</span>
                            <Switch checked={checked} onCheckedChange={handleChange} aria-label="자동 저장 토글" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>마지막 변경 후 3초가 지나면 자동 저장</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
