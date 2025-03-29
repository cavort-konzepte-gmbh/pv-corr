import { useEffect, useRef } from "react";

/**
 * Executes the provided callback when the specified key is pressed.
 *
 * @param callback - Function to be called when the key is pressed
 * @param isSend - Extra condition before calling the callback
 * @param key - The key to listen for
 * @param debounceTime - Time in ms to wait between key presses
 */
export const useKeyAction = <T extends (...args: any[]) => void>(
  callback: T,
  isSend: boolean,
  key: string = "Enter",
  debounceTime: number = 500,
) => {
  const lastExecuted = useRef<number>(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key && isSend) {
        const now = Date.now();
        if (now - lastExecuted.current >= debounceTime) {
          callback();
          lastExecuted.current = now;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [callback, isSend, key, debounceTime]);
};
