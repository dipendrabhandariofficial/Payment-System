import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing temporary error/success messages that auto-clear
 * @param {number} duration - Duration in milliseconds before clearing (default: 3000)
 * @returns {[string, (message: string) => void, () => void]} - [message, setMessage, clearMessage]
 */
export const useTemporaryMessage = (duration = 3000) => {
    const [message, setMessage] = useState("");
    const timeoutRef = useRef(null);

    const setTemporaryMessage = (newMessage) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set the new message
        setMessage(newMessage);

        // Set timeout to clear the message
        if (newMessage) {
            timeoutRef.current = setTimeout(() => {
                setMessage("");
                timeoutRef.current = null;
            }, duration);
        }
    };

    const clearMessage = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setMessage("");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return [message, setTemporaryMessage, clearMessage];
};

export default useTemporaryMessage;
