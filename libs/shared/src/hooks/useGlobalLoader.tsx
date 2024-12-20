import { create } from 'zustand';

export const useLoaderStore = create(set => ({
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const useGlobalLoader = () => {
    const isLoading = useLoaderStore(state => state.isLoading);
    const setIsLoading = useLoaderStore(state => state.setIsLoading);

    return { isLoading, setIsLoading };
};
