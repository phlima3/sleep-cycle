import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// VAPID key for web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseAnalytics = (): Analytics | null => {
  if (typeof window === 'undefined') return null;

  if (!analytics) {
    try {
      const app = initializeFirebase();
      analytics = getAnalytics(app);
    } catch (error) {
      console.error('[Firebase] Error initializing analytics:', error);
      return null;
    }
  }
  return analytics;
};

export const trackEvent = (eventName: string, params?: Record<string, unknown>): void => {
  const analytics = getFirebaseAnalytics();
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') return null;

  if (!messaging) {
    try {
      const app = initializeFirebase();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('[Firebase] Error initializing messaging:', error);
      return null;
    }
  }
  return messaging;
};

/**
 * Request permission and get FCM token
 */
export const requestFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.error('[Firebase] Messaging not available');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Firebase] Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('[Firebase] FCM Token:', token);
      // Store token for later use (e.g., send to backend for scheduling)
      localStorage.setItem('fcm-token', token);
      return token;
    }

    console.log('[Firebase] No registration token available');
    return null;
  } catch (error) {
    console.error('[Firebase] Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: unknown) => void): (() => void) | null => {
  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Get stored FCM token
 */
export const getStoredFCMToken = (): string | null => {
  return localStorage.getItem('fcm-token');
};

/**
 * Remove FCM token (when disabling notifications)
 */
export const removeFCMToken = (): void => {
  localStorage.removeItem('fcm-token');
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    VAPID_KEY
  );
};
