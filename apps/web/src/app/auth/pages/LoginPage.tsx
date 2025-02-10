import { useLocation } from 'react-router-dom';

import { Images } from '@eurekabox/assets';
import { useGlobalLoader } from '@eurekabox/shared';
import { Button } from '@eurekabox/ui-kit/components/ui/button';

export const LoginPage = () => {
    const { setIsLoading } = useGlobalLoader();
    const location = useLocation();
    const from = location.state?.from || '/home';

    const onClickLogin = (provider: string) => {
        setIsLoading(true);
        const HOST = import.meta.env.VITE_HOST.toLowerCase();
        const SOCIAL_OAUTH = import.meta.env.VITE_SOCIAL_OAUTH_ENDPOINT.toLowerCase();
        const state = encodeURIComponent(JSON.stringify({ from }));
        const redirectUrl = `${HOST}/auth/oauth-response?state=${state}`;

        window.location.replace(`${SOCIAL_OAUTH}/oauth/${provider}/authorize?redirect=${redirectUrl}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="text-center mb-8 justify-items-center">
                <img src={Images.boxLogo} alt="EurekaBox Logo" className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Welcome to EurekaBox</h1>
            </div>

            <Button
                className="w-[360px] h-[48px] flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                onClick={() => onClickLogin('google')}
            >
                <img src={Images.googleLogo} alt="Google Logo" width={20} height={20} />
                <span>Log in with Google account</span>
            </Button>
        </div>
    );
};
