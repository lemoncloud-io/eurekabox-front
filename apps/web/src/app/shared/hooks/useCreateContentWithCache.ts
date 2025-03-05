import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ContentView } from '@lemoncloud/eureka-contents-api';

import type { CreateContentDTO } from '@eurekabox/contents';
import { useCreateContent } from '@eurekabox/contents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';

import { useContentCache } from './useContentCache';

export const useCreateContentWithCache = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { prependContentToCache } = useContentCache();
    const createContent = useCreateContent();
    const { setIsLoading } = useGlobalLoader();

    const handleCreate = useCallback(async () => {
        setIsLoading(true);
        const newContent: CreateContentDTO = {
            name: '',
            title: '',
            subject: '',
        };

        try {
            await createContent.mutateAsync(newContent, {
                onSuccess: async (response: ContentView) => {
                    await prependContentToCache(response);
                    navigate(`/${response.id}`);
                },
            });
        } catch (e) {
            toast({ description: t('generalError'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [createContent, navigate, prependContentToCache, t]);

    return {
        handleCreate,
        isPending: createContent.isPending,
    };
};
