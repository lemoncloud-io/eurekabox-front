import { create } from 'zustand';

import { webCore } from '../core';

export type UserProfile = never;
export type UserView = never;

export interface WebCoreState {
    isInitialized: boolean;
    isAuthenticated: boolean;
    error: Error | null;
    profile: UserProfile | null;
    userName: string;
}

export interface WebCoreStore extends WebCoreState {
    initialize: () => void;
    logout: () => Promise<void>;
    setIsAuthenticated: (isAuth: boolean) => void;
    setProfile: (profile: UserProfile) => void;
    updateUserName: (user: UserView) => void;
}

const initialState: Pick<WebCoreStore, keyof WebCoreState> = {
    isInitialized: false,
    isAuthenticated: false,
    error: null,
    profile: null,
    userName: '',
};

export const useWebCoreStore = create<WebCoreStore>()(set => ({
    ...initialState,
    initialize: async () => {
        set({ isInitialized: false, error: null });
        try {
            await webCore.init();
            const isAuthenticated = await webCore.isAuthenticated();
            set({ isInitialized: true, isAuthenticated });
        } catch (error: unknown) {
            const e = error as Error;
            console.log(e);
            set({ error: e, isInitialized: false });
            await webCore.logout();
        }
    },
    logout: async () => {
        await webCore.logout();
        set({ isAuthenticated: false, profile: null, userName: '' });
        window.location.href = '/auth/login';
    },
    setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
    setProfile: (profile: UserProfile) =>
        set({
            profile,
            userName: profile['$user']?.name || 'Unknown',
        }),
    updateUserName: (user: UserView) =>
        set(state => {
            const profile = { ...state.profile, $user: user };
            const userName = user['name'];
            return { ...state, profile, userName };
        }),
}));
