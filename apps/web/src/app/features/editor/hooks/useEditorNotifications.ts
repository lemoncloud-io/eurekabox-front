import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from '@eurekabox/lib/hooks/use-toast';

import type { EditorNotificationEventData, EditorNotificationEventType } from '../types';

export const useEditorNotifications = () => {
    const { t } = useTranslation();

    const notify = useCallback(
        <T extends EditorNotificationEventType>(eventType: T, data: EditorNotificationEventData<T>) => {
            switch (eventType) {
                case 'load-error':
                    toast({
                        variant: 'destructive',
                        title: t('editorPage.error.title'),
                        description: t('editorPage.load.error'),
                    });
                    console.error('Load failed:', (data as any).error);
                    break;

                case 'save-success':
                    toast({
                        title: t('editorPage.save.complete'),
                        description: t('editorPage.save.success'),
                    });
                    break;

                case 'save-error':
                    toast({
                        variant: 'destructive',
                        title: t('editorPage.save.failed'),
                        description: t('editorPage.save.error'),
                    });
                    console.error('Save failed:', (data as any).error);
                    break;

                case 'export-success':
                    toast({
                        title: t('editorPage.export.complete'),
                        description: t('editorPage.export.success'),
                    });
                    break;

                case 'export-error':
                    toast({
                        variant: 'destructive',
                        title: t('editorPage.export.failed'),
                        description: t('editorPage.export.error'),
                    });
                    console.error('Export failed:', (data as any).error);
                    break;
            }
        },
        [t]
    );

    const notifyLoadError = useCallback(
        (error: Error) => {
            notify('load-error', { error });
        },
        [notify]
    );

    const notifySaveSuccess = useCallback(
        (title?: string) => {
            notify('save-success', { title });
        },
        [notify]
    );

    const notifySaveError = useCallback(
        (error: unknown) => {
            notify('save-error', { error });
        },
        [notify]
    );

    return {
        notify,
        notifyLoadError,
        notifySaveSuccess,
        notifySaveError,
    };
};
