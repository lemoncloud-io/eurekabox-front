import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

/**
 * 페이지 이동 방지 훅
 * @param {Function} blocker - 페이지 이동을 차단할 조건 함수. true를 반환하면 이동을 차단.
 * @param {boolean} when - 훅이 활성화될 조건.
 */
export const useBlocker = (blocker, when = true) => {
    const { navigator } = useContext(NavigationContext);

    useEffect(() => {
        if (!when) return;

        const originalPush = navigator.push;
        const originalReplace = navigator.replace;

        navigator.push = (...args) => {
            if (!blocker()) {
                originalPush(...args);
            }
        };

        navigator.replace = (...args) => {
            if (!blocker()) {
                originalReplace(...args);
            }
        };

        return () => {
            navigator.push = originalPush;
            navigator.replace = originalReplace;
        };
    }, [navigator, blocker, when]);
};
