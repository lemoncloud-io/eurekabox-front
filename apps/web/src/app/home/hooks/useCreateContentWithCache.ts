import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ContentView } from '@lemoncloud/lemon-contents-api';

import type { CreateContentDTO } from '@eurekabox/contents';
import { useCreateContent } from '@eurekabox/contents';

import { useContentCache } from './useContentCache';

export const useCreateContentWithCache = () => {
    const navigate = useNavigate();
    const { prependContentToInfiniteCache } = useContentCache();
    const createContent = useCreateContent();

    const handleCreate = useCallback(async () => {
        const newContent: CreateContentDTO = {
            name: '',
            title: 'Untitled',
            subject: '',
        };

        await createContent.mutateAsync(newContent, {
            onSuccess: (response: ContentView) => {
                prependContentToInfiniteCache(response);
                navigate(`/home/${response.id}`);
            },
        });
    }, [createContent, navigate, prependContentToInfiniteCache]);

    return {
        handleCreate,
        isPending: createContent.isPending,
    };
};
