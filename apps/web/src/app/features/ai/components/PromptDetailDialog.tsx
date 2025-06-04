import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PromptView } from '@lemoncloud/ssocio-chatbots-api';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/lib/components/ui/dialog';


interface PromptDetailDialogProps {
    prompt: PromptView | null;
    open: boolean;
    onClose: () => void;
}

export const PromptDetailDialog: React.FC<PromptDetailDialogProps> = ({ prompt, open, onClose }) => {
    const { t } = useTranslation();

    if (!prompt) {
        return null;
    }

    const formattedContent = prompt.contents.join('\n');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="max-w-[700px] max-h-[80vh] pt-0">
                <DialogHeader>
                    <DialogTitle>
                        {prompt.name} ({prompt.stereo === 'system' ? 'System' : 'User'} Prompt)
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md font-mono">
                        {formattedContent}
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    );
};
