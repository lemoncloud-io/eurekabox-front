import { useCallback, useEffect, useRef, useState } from 'react';

interface UseNewMessageBadgeOptions {
    shouldAutoScroll: boolean;
    isWaitingResponse: boolean;
}

export const useNewMessageBadge = ({ shouldAutoScroll, isWaitingResponse }: UseNewMessageBadgeOptions) => {
    const [showBadge, setShowBadge] = useState(false);
    const wasWaitingRef = useRef(false);

    useEffect(() => {
        const responseCompleted = wasWaitingRef.current && !isWaitingResponse;

        if (responseCompleted && !shouldAutoScroll) {
            setShowBadge(true);
        }

        wasWaitingRef.current = isWaitingResponse;
    }, [isWaitingResponse, shouldAutoScroll]);

    // 사용자가 하단으로 스크롤하면 배지 숨김
    useEffect(() => {
        if (shouldAutoScroll && showBadge) {
            setShowBadge(false);
        }
    }, [shouldAutoScroll, showBadge]);

    const handleBadgeClick = useCallback((onScrollToBottom: () => void) => {
        onScrollToBottom();
        setShowBadge(false);
    }, []);

    return {
        showBadge,
        handleBadgeClick,
    };
};
