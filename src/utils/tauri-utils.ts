// Utility to detect if the app is running in Tauri environment
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.__TAURI__ !== undefined || 
          // Additional checks for production Tauri builds
          (typeof window !== 'undefined' && 
           (window.location?.protocol === 'tauri:' || 
            navigator.userAgent.includes('Tauri'))));
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
// Note: These are only used in development/browser mode, not in production Tauri builds
export const getDevFallbackPaths = () => {
  const isWindows = navigator.userAgent.indexOf('Win') !== -1;
  const isMac = navigator.userAgent.indexOf('Mac') !== -1;
  
  // These fallback paths are for development only
  // In production Tauri builds, the actual Tauri APIs should work
  if (isWindows) {
    // Generic Windows development paths
    return {
      home: 'C:\\Users\\Public',
      appDir: 'C:\\Users\\Public\\AppData\\Local\\com.start.pro',
      collections: 'C:\\Users\\Public\\AppData\\Local\\com.start.pro\\collections',
    };
  } else if (isMac) {
    return {
      home: '/Users/Shared',
      appDir: '/Users/Shared/Library/Application Support/com.start.pro',
      collections: '/Users/Shared/Library/Application Support/com.start.pro/collections',
    };
  } else {
    return {
      home: '/tmp',
      appDir: '/tmp/.local/share/com.start.pro',
      collections: '/tmp/.local/share/com.start.pro/collections',
    };
  }
};

declare global {
  interface Window {
    __TAURI__: any;
  }
} 