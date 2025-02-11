import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import type { CreateContentDTO } from '@eurekabox/contents';
import { useCreateContent } from '@eurekabox/contents';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { useGlobalLoader } from '@eurekabox/shared';

import { useContentCache } from './useContentCache';

export const useCreateContentWithCache = () => {
    const navigate = useNavigate();
    const { prependContentToCache } = useContentCache();
    const createContent = useCreateContent();
    const { setIsLoading } = useGlobalLoader();

    const handleCreate = useCallback(async () => {
        setIsLoading(true);
        const newContent: CreateContentDTO = {
            name: '',
            title: 'New Page',
            subject: '',
        };

        try {
            await createContent.mutateAsync(newContent, {
                onSuccess: (response: ContentView) => {
                    prependContentToCache(response);
                    navigate(`/${response.id}`);
                },
            });
        } catch (e) {
            toast({ description: '에러가 발생했습니다.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [createContent, navigate, prependContentToCache]);

    return {
        handleCreate,
        isPending: createContent.isPending,
    };
};
