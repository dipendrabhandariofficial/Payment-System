import { useState, useCallback } from 'react';
import { UseBooleanReturn } from '@types/hooks';

/**
 * Custom hook to manage boolean state with helper functions
 * Perfect for managing modals, dialogs, popups, etc.
 * 
 * @param initialValue - Initial state value (default: false)
 * @returns [value, { on, off, toggle, setValue }]
 * 
 * @example
 * const [isOpen, { on: open, off: close, toggle }] = useBoolean();
 * const [showModal, modalActions] = useBoolean(false);
 */
export const useBoolean = (initialValue = false): [boolean, UseBooleanReturn] => {
  const [value, setValue] = useState<boolean>(initialValue);

  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return [
    value,
    { value, on, off, toggle, setValue }
  ];
};

export default useBoolean;
