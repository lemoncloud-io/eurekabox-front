import { useMutation } from '@tanstack/react-query';

import { useWebCoreStore } from '../stores';

type HandleSuccessEventFunc = (value?: never) => void;

type HandleErrorEventFunc = (error?: Error) => void;

export const useLogout = (handleSuccessEvent?: HandleSuccessEventFunc, handleErrorEvent?: HandleErrorEventFunc) => {
    const logout = useWebCoreStore(state => state.logout);

    return useMutation({
        mutationKey: ['LOGOUT_USER'],
        mutationFn: async () => await logout(),
        onSuccess(data) {
            handleSuccessEvent && handleSuccessEvent(data);
        },
        onError(error) {
            handleErrorEvent && handleErrorEvent(error);
        },
    });
};
