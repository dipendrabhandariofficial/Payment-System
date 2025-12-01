import { useState, useCallback } from 'react';

interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

interface UseDisclosureOptions {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Enhanced hook for managing disclosure state (modals, drawers, etc.)
 * with optional callbacks
 * 
 * @param options - Configuration options
 * @returns Disclosure control object
 * 
 * @example
 * const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
 *   onOpen: () => console.log('Modal opened'),
 *   onClose: () => console.log('Modal closed')
 * });
 */
export const useDisclosure = (options: UseDisclosureOptions = {}): UseDisclosureReturn => {
  const {
    defaultIsOpen = false,
    onOpen: onOpenCallback,
    onClose: onCloseCallback,
  } = options;

  const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    onOpenCallback?.();
  }, [onOpenCallback]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    onCloseCallback?.();
  }, [onCloseCallback]);

  const onToggle = useCallback(() => {
    isOpen ? onClose() : onOpen();
  }, [isOpen, onOpen, onClose]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
};

export default useDisclosure;
