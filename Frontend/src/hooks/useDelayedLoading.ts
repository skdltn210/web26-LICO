import { useState, useEffect } from 'react';

interface UseDelayedLoadingOptions {
  minLoadingTime?: number;
}

export function useDelayedLoading(isLoading: boolean, options: UseDelayedLoadingOptions = {}) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const { minLoadingTime = 500 } = options;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShouldShowLoading(true);
      }, minLoadingTime);
    } else {
      setShouldShowLoading(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, minLoadingTime]);

  return shouldShowLoading && isLoading;
}
