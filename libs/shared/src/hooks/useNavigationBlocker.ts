import { useCallback, useEffect } from 'react';
import { unstable_useBlocker, useNavigate } from 'react-router-dom';

export function useNavigationBlocker(shouldBlock: boolean) {
    const navigate = useNavigate();

    const blocker = useCallback(
        ({ currentLocation, nextLocation }) => {
            if (shouldBlock && currentLocation.pathname !== nextLocation.pathname) {
                const userConfirmed = window.confirm(
                    '작성 중인 내용이 저장되지 않을 수 있습니다. 정말 나가시겠습니까?'
                );
                if (userConfirmed) {
                    return false;
                }
                return true;
            }
            return false;
        },
        [shouldBlock]
    );

    unstable_useBlocker(blocker);

    // 브라우저 새로고침/닫기 감지
    useEffect(() => {
        if (!shouldBlock) return;

        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [shouldBlock]);
}
