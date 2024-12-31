import { useBlocker } from '@eurekabox/shared';

/**
 * 페이지 이동 방지를 구현하는 커스텀 훅
 * @param {boolean} hasUnsavedChanges - 저장되지 않은 변경사항 여부.
 * @param {Function} checkForChanges - 변경사항을 확인하는 함수. true를 반환하면 변경사항 있음.
 */
export const usePageLeaveBlocker = (hasUnsavedChanges: boolean, checkForChanges: () => boolean) => {
    useBlocker(() => {
        if (hasUnsavedChanges && checkForChanges()) {
            return !window.confirm('저장되지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?');
        }
        return false;
    }, hasUnsavedChanges);
};
