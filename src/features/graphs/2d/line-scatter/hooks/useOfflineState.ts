import { useState, useEffect } from 'react';

/**
 * Hook to detect and handle offline state
 */
export const useOfflineState = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
};

/**
 * Hook to handle network-dependent operations with offline support
 */
export const useNetworkOperation = () => {
  const { isOffline } = useOfflineState();

  const executeWithNetworkCheck = async <T>(
    operation: () => Promise<T>,
    offlineFallback?: () => T | Promise<T>
  ): Promise<T> => {
    if (isOffline) {
      if (offlineFallback) {
        console.warn('Operation executed offline with fallback');
        return await offlineFallback();
      } else {
        throw new Error('Operation requires network connection');
      }
    }

    try {
      return await operation();
    } catch (error) {
      // If operation fails and we have an offline fallback, try it
      if (offlineFallback && !isOffline) {
        console.warn('Network operation failed, trying offline fallback');
        return await offlineFallback();
      }
      throw error;
    }
  };

  return {
    isOffline,
    executeWithNetworkCheck
  };
};
