import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWebCoreStore, createCredentialsByProvider } from '@lemonote/web-core';
import { Images } from '@lemonote/assets';

export const OAuthResponsePage = () => {
    const setIsAuthenticated = useWebCoreStore(state => state.setIsAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();
    const checkLoginResultCalled = useRef(false);

    useEffect(() => {
        if (checkLoginResultCalled.current) {
            return;
        }
        checkLoginResultCalled.current = true;
        const checkLoginResult = async () => {
            const routeParams = new URLSearchParams(location.search);
            const code = routeParams.get('code') || '';
            const provider = routeParams.get('provider') || '';
            const isSuccess = code.length > 5;
            if (isSuccess) {
                await createCredentialsByProvider(provider, code);
                setIsAuthenticated(true);
                navigate('/home');
                return;
            }
            // Error occurred!
            navigate('/auth/login');
        };

        checkLoginResult();
    }, [location.search]);

    return (
        <div className="bg-black w-screen h-screen flex flex-col items-center justify-center gap-12 max-sm:gap-6 fixed inset-0 bg-opacity-50 z-[1000]">
            <img className="w-[160px] max-sm:w-[160px]" src={Images.logo} alt="" />
            <img className="h-[42px] animate-spin" src={Images.loader} alt="" />
        </div>
    );
};

export default OAuthResponsePage;
