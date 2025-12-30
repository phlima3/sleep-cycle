/**
 * Background Sync Utilities
 *
 * Provides helpers for registering background sync events
 * that allow the app to sync data when connectivity is restored.
 */

// Extend ServiceWorkerRegistration to include sync
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: SyncManager;
}

/**
 * Check if Background Sync API is supported
 */
export const isBackgroundSyncSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
};

/**
 * Register a background sync event
 * @param tag - The sync tag identifier (e.g., 'sync-sleep-history')
 * @returns Promise<boolean> - Whether registration was successful
 */
export const registerBackgroundSync = async (tag: string): Promise<boolean> => {
  if (!isBackgroundSyncSupported()) {
    console.log('[BackgroundSync] Not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistrationWithSync;
    await registration.sync.register(tag);
    console.log(`[BackgroundSync] Registered sync: ${tag}`);
    return true;
  } catch (error) {
    console.error('[BackgroundSync] Registration failed:', error);
    return false;
  }
};

/**
 * Sync tags used in the app
 */
export const SYNC_TAGS = {
  SLEEP_HISTORY: 'sync-sleep-history',
} as const;

/**
 * Request sync for sleep history
 * Call this when adding entries while offline
 */
export const requestSleepHistorySync = (): Promise<boolean> => {
  return registerBackgroundSync(SYNC_TAGS.SLEEP_HISTORY);
};

/**
 * Store pending sync data in localStorage
 * (To be used when IndexedDB is not available)
 */
export const storePendingSync = <T>(key: string, data: T): void => {
  try {
    const pending = getPendingSync<T>(key);
    pending.push(data);
    localStorage.setItem(`pending-sync-${key}`, JSON.stringify(pending));
  } catch (error) {
    console.error('[BackgroundSync] Failed to store pending sync:', error);
  }
};

/**
 * Get pending sync data from localStorage
 */
export const getPendingSync = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(`pending-sync-${key}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Clear pending sync data
 */
export const clearPendingSync = (key: string): void => {
  localStorage.removeItem(`pending-sync-${key}`);
};
