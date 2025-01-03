import { useLocation } from 'react-router-dom';

import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Card } from '@eurekabox/ui-kit/components/ui/card';

import { Images } from '@eurekabox/assets';
import { useGlobalLoader } from '@eurekabox/shared';

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
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md p-8 space-y-8 glassmorphism">
                <div className="text-center">
                    <h1 className="text-4xl font-bold gradient-text mb-2">EurekaBox</h1>
                    <p className="text-muted-foreground">Sign in to continue</p>
                </div>

                <div className="space-y-4">
                    <Button
                        className="w-full flex items-center justify-center space-x-2"
                        variant="outline"
                        onClick={() => onClickLogin('google')}
                    >
                        <img src={Images.googleLogo} alt="Google Logo" width={20} height={20} />
                        <span>Sign in with Google</span>
                    </Button>

                    <Button
                        className="w-full flex items-center justify-center space-x-2 bg-[#FEE500] text-[#000000] hover:bg-[#FEE500]/90"
                        onClick={() => onClickLogin('kakao')}
                    >
                        <img src={Images.kakaoLogo} alt="Kakao Logo" width={20} height={20} />
                        <span>Sign in with Kakao</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
};
