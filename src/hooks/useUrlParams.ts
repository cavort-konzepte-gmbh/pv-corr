import { useEffect, useRef } from 'react';

export const useUrlParams = (params: Record<string, string | undefined | null>, setParams: (key: string, value: string | undefined | null) => void) => {
  const isInitialMount = useRef(true);

  // Update URL when params change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const url = new URL(window.location.href);
    
    // Update or remove each param
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    // Update URL without reloading
    window.history.replaceState({}, '', url.toString());
  }, [params]);

  // Read initial params on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value) {
        setParams(key, value);
      }
    });
  }, [setParams]); // Run when setParams changes
};