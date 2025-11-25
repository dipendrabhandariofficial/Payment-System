import { useState, useCallback } from 'react';

/**
 * Enhanced hook for managing disclosure state (modals, drawers, etc.)
 * with optional callbacks
 * 
 * @param {object} options - Configuration options
 * @param {boolean} options.defaultIsOpen - Initial state (default: false)
 * @param {function} options.onOpen - Callback when opened
 * @param {function} options.onClose - Callback when closed
 * 
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure({
 *   onOpen: () => console.log('Modal opened'),
 *   onClose: () => console.log('Modal closed')
 * });
 */
export const useDisclosure = (options = {}) => {
    const {
        defaultIsOpen = false,
        onOpen: onOpenCallback,
        onClose: onCloseCallback,
    } = options;

    const [isOpen, setIsOpen] = useState(defaultIsOpen);

    const open = useCallback(() => {
        setIsOpen(true);
        onOpenCallback?.();
    }, [onOpenCallback]);

    const close = useCallback(() => {
        setIsOpen(false);
        onCloseCallback?.();
    }, [onCloseCallback]);

    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, open, close]);

    return {
        isOpen,
        open,
        close,
        toggle,
        onOpen: open,
        onClose: close,
        onToggle: toggle,
    };
};

export default useDisclosure;
