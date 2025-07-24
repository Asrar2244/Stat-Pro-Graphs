// Utility to detect if the app is running in Tauri environment
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

// Safe wrapper for Tauri API calls
export const safeTauriCall = async <T>(
  tauriFunction: () => Promise<T>,
  fallback: T | (() => Promise<T>)
): Promise<T> => {
  try {
    if (isTauriEnvironment()) {
      return await tauriFunction();
    } else {
      return typeof fallback === 'function' ? await (fallback as () => Promise<T>)() : fallback;
    }
  } catch (error) {
    console.warn('Tauri API call failed, using fallback:', error);
    return typeof fallback === 'function' ? await (fallback as () => Promise<T>)() : fallback;
  }
};

// Development fallbacks for common paths
export const getDevFallbackPaths = () => {
  const isWindows = navigator.userAgent.indexOf('Win') !== -1;
  const isMac = navigator.userAgent.indexOf('Mac') !== -1;
  
  // Use reasonable fallback paths since process.env is not available in Tauri frontend
  if (isWindows) {
    return {
      home: 'C:\\Users\\User',
      appDir: 'C:\\Users\\User\\AppData\\Local\\start-pro',
      collections: 'C:\\Users\\User\\AppData\\Local\\start-pro\\collections',
    };
  } else if (isMac) {
    return {
      home: '/Users/user',
      appDir: '/Users/user/Library/Application Support/start-pro',
      collections: '/Users/user/Library/Application Support/start-pro/collections',
    };
  } else {
    return {
      home: '/home/user',
      appDir: '/home/user/.local/share/start-pro',
      collections: '/home/user/.local/share/start-pro/collections',
    };
  }
};

declare global {
  interface Window {
    __TAURI__: any;
  }
} 