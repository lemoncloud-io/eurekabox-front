import { create } from 'zustand';

import { LANGUAGE_KEY, webCore } from '../core';

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

/**
 * Initial state configuration for the web core store
 */
const initialState: Pick<WebCoreStore, keyof WebCoreState> = {
    isInitialized: false,
    isAuthenticated: false,
    error: null,
    profile: null,
    userName: '',
};

/**
 * Zustand store for managing web core state and actions
 */
export const useWebCoreStore = create<WebCoreStore>()(set => ({
    ...initialState,

    /**
     * Initializes the web core application
     * - Sets up authentication state
     * - Configures language preferences
     * - Handles initialization errors
     */
    initialize: async () => {
        set({ isInitialized: false, error: null });
        await webCore.init();
        await webCore.setUseXLemonLanguage(true, LANGUAGE_KEY);
        const isAuthenticated = await webCore.isAuthenticated();
        set({ isInitialized: true, isAuthenticated });
    },

    /**
     * Handles user logout
     * - Clears authentication state
     * - Removes user profile data
     * - Redirects to login page
     */
    logout: async () => {
        await webCore.logout();
        set({ isAuthenticated: false, profile: null, userName: '' });
        window.location.href = '/auth/login';
    },

    /**
     * Updates authentication state
     * @param isAuthenticated - New authentication state
     */
    setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

    /**
     * Updates user profile information
     * @param profile - User profile data
     */
    setProfile: (profile: UserProfile) =>
        set({
            profile,
            userName: profile['$user']?.name || 'Unknown',
        }),

    /**
     * Updates username and related profile information
     * @param user - Updated user view data
     */
    updateUser: (user: UserView) =>
        set(state => {
            if (!state.profile) {
                return state;
            }

            const profile = { ...state.profile, $user: user };
            const userName = user.name;
            return { ...state, profile, userName };
        }),
}));
