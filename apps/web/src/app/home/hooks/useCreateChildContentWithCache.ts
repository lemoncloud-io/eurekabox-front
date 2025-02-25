import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import type { CreateChildContentDTO } from '@eurekabox/contents';
import { useCreateChildContent } from '@eurekabox/contents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';


export const useCreateChildContentWithCache = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // const { prependContentToCache } = useContentCache();
    const createChildContent = useCreateChildContent();
    const { setIsLoading } = useGlobalLoader();

    const handleCreateChild = useCallback(
        async (parentId: string) => {
            setIsLoading(true);
            const newChildContent: CreateChildContentDTO = {
                name: '',
                title: '',
                subject: '',
                parentId,
            };

            try {
                await createChildContent.mutateAsync(newChildContent, {
                    onSuccess: (response: ContentView) => {
                        // prependContentToCache(response);
                        navigate(`/${response.id}`);
                    },
                });
            } catch (e) {
                toast({ description: t('generalError'), variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        },
        [createChildContent, navigate]
    );

    return {
        handleCreateChild,
        isPending: createChildContent.isPending,
    };
};
