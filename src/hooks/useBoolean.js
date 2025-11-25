import { useState, useCallback } from 'react';

/**
 * Custom hook to manage boolean state with helper functions
 * Perfect for managing modals, dialogs, popups, etc.
 * 
 * @param {boolean} initialValue - Initial state value (default: false)
 * @returns {[boolean, object]} - [value, { on, off, toggle, set }]
 * 
 * @example
 * const [isOpen, { on: open, off: close, toggle }] = useBoolean();
 * const [showModal, modalActions] = useBoolean(false);
 */
export const useBoolean = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);

    // Memoize functions to prevent unnecessary re-renders
    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue(prev => !prev), []);
    const set = useCallback((newValue) => setValue(newValue), []);

    return [
        value,
        {
            on,
            off,
            toggle,
            set,
            open: on,
            close: off,
            show: on,
            hide: off,
        }
    ];
};

export default useBoolean;
