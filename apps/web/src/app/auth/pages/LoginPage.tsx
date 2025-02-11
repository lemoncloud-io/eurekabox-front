import { useLocation } from 'react-router-dom';

import { Images, Logo } from '@eurekabox/assets';
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
            <div className="mb-7 flex flex-col justify-center items-center gap-2">
                <img src={Logo.purpleSymbol} alt="EurekaBox Logo" className="w-[76px]" />
                <h1 className="text-xl text-text font-medium">Welcome to EurekaBox</h1>
            </div>

            <Button
                className="relative w-[350px] h-[52px] flex items-center justify-center px-[18px] bg-background hover:border-[#8F19F6] dark:hover:border-[#7522BD] rounded-[8px] border  border-[#53555B]"
                onClick={() => onClickLogin('google')}
            >
                <img
                    className="absolute left-[18px]"
                    src={Images.googleLogo}
                    alt="Google Logo"
                    width={21}
                    height={21}
                />
                <span className="text-text font-medium">Log in with Google account</span>
            </Button>
        </div>
    );
};
