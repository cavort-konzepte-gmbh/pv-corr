import { useRef } from 'react'

/**
 * This hook debounces the provided function and returns the debounced function
 * after the specified delay.
 *
 * @param callback - Function to be debounced
 * @param delay - The delay in milliseconds
 * @returns the debounced function
 */
export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number = 500) => {
  const timeout = useRef<NodeJS.Timeout | null>(null)

  return (...args: Parameters<T>) => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    timeout.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
