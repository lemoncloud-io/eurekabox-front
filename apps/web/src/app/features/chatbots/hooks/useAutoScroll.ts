import { useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
    dependencies: any[];
    threshold?: number; // 하단에서 얼마나 가까이 있어야 자동 스크롤할지 (px)
    behavior?: ScrollBehavior;
}

export const useAutoScroll = ({ dependencies, threshold = 100, behavior = 'smooth' }: UseAutoScrollOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const lastScrollTopRef = useRef(0);

    // 스크롤 위치 추적
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight <= threshold;

        // 사용자가 수동으로 위로 스크롤했는지 감지
        const isScrollingUp = scrollTop < lastScrollTopRef.current;

        if (isScrollingUp && !isNearBottom) {
            shouldAutoScrollRef.current = false;
        } else if (isNearBottom) {
            shouldAutoScrollRef.current = true;
        }

        lastScrollTopRef.current = scrollTop;
    }, [threshold]);

    // 하단으로 스크롤
    const scrollToBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container || !shouldAutoScrollRef.current) return;

        // DOM 업데이트 완료 후 스크롤 실행
        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        });
    }, [behavior]);

    // 의존성 변경 시 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, dependencies);

    // 강제 스크롤 함수 (새 대화 시작 등)
    const forceScrollToBottom = useCallback(() => {
        shouldAutoScrollRef.current = true;
        scrollToBottom();
    }, [scrollToBottom]);

    return {
        containerRef,
        handleScroll,
        scrollToBottom,
        forceScrollToBottom,
        shouldAutoScroll: shouldAutoScrollRef.current,
    };
};
