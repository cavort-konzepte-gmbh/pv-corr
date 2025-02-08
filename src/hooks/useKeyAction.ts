import { useEffect } from "react";

/**
 * Executes the provided callback when the specified key is pressed.
 * 
 * @param callback - Function to be called when the key is pressed
 * @param isSend - Extra condition before calling the callback
 * @param key - The key to listen for
 */
export const useKeyAction = <T extends (...args: any[]) => void>(
  callback: T,
  isSend: boolean,
  key: string = "Enter",
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key && isSend) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [callback, isSend, key]);
};