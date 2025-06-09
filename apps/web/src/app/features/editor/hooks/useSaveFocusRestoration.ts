import { useCallback, useRef } from 'react';

import type { YooEditor } from '@yoopta/editor';

import { saveSelection } from '../../../shared';

interface FocusState {
    isTitleFocused: boolean;
    currentPath: any;
    savedSelection: { start: number; end: number } | null;
}

export const useSaveFocusRestoration = (editor: YooEditor, titleInputRef: React.RefObject<HTMLInputElement>) => {
    const savedSelectionRef = useRef<{ start: number; end: number } | null>(null);

    const captureFocusState = useCallback((): FocusState => {
        const isTitleFocused = document.activeElement === titleInputRef.current;
        const currentPath = editor.path;
        const savedSelection = saveSelection();

        savedSelectionRef.current = savedSelection;

        return {
            isTitleFocused,
            currentPath,
            savedSelection,
        };
    }, [editor, titleInputRef]);

    const restoreFocus = useCallback(
        (
            focusState: FocusState,
            editorContent: any,
            focusBlockWithOptions: (editor: YooEditor, blockId: string) => void
        ) => {
            const { isTitleFocused, currentPath } = focusState;

            if (isTitleFocused && titleInputRef.current) {
                titleInputRef.current.focus();
            } else if (currentPath.current !== null) {
                const previousBlock = Object.entries(editorContent)[currentPath.current];
                if (previousBlock?.length) {
                    focusBlockWithOptions(editor, previousBlock[0]);
                } else {
                    editor.focus();
                }
            } else {
                editor.focus();
            }
        },
        [editor, titleInputRef]
    );

    return {
        captureFocusState,
        restoreFocus,
        savedSelectionRef,
    };
};
