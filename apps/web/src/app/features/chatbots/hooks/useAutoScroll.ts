import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoScrollOptions {
    dependencies: any[];
    threshold?: number; // 하단에서 얼마나 가까이 있어야 자동 스크롤할지 (px)
    behavior?: ScrollBehavior;
}

export const useAutoScroll = ({ dependencies, threshold = 100, behavior = 'smooth' }: UseAutoScrollOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const lastScrollTopRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight <= threshold;
            const isScrollingUp = scrollTop < lastScrollTopRef.current;

            if (isScrollingUp && !isNearBottom) {
                setShouldAutoScroll(false);
            } else if (isNearBottom) {
                setShouldAutoScroll(true);
            }

            lastScrollTopRef.current = scrollTop;
        }, 50);
    }, [threshold]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const scrollToBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container || !shouldAutoScroll) return;

        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        });
    }, [behavior, shouldAutoScroll]);

    useEffect(() => {
        scrollToBottom();
    }, dependencies);

    // 강제 스크롤 함수 (새 대화 시작 등)
    const forceScrollToBottom = useCallback(() => {
        setShouldAutoScroll(true);
        const container = containerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        });
    }, [behavior]);

    return {
        containerRef,
        handleScroll,
        scrollToBottom,
        forceScrollToBottom,
        shouldAutoScroll,
    };
};
