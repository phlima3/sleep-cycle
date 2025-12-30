// Firebase Messaging Service Worker
// This service worker handles background push notifications from FCM

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config will be injected from the main app
// For now, we'll use self.__FIREBASE_CONFIG__ which can be set via postMessage
let firebaseConfig = null;

// Listen for messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }

  // Handle local notification requests
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, data } = event.data;
    self.registration.showNotification(title || 'SleepCycle', {
      body: body || 'Hora de dormir!',
      icon: '/android/android-launchericon-192-192.png',
      badge: '/android/android-launchericon-96-96.png',
      vibrate: [200, 100, 200],
      tag: 'sleep-reminder-' + Date.now(),
      data: data || { url: '/' },
    });
  }
});

function initializeFirebase() {
  if (!firebaseConfig) {
    console.log('[FCM SW] No Firebase config available');
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'SleepCycle';
      const notificationOptions = {
        body: payload.notification?.body || 'Hora de dormir!',
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-96-96.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'sleep-reminder',
        renotify: true,
        requireInteraction: true,
        data: {
          url: payload.data?.url || '/',
          ...payload.data,
        },
        actions: [
          { action: 'open', title: 'Abrir App' },
          { action: 'snooze', title: 'Soneca 10min' },
        ],
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });

    console.log('[FCM SW] Firebase initialized successfully');
  } catch (error) {
    console.error('[FCM SW] Error initializing Firebase:', error);
  }
}

// Handle generic push events (for DevTools testing and non-FCM push)
self.addEventListener('push', (event) => {
  console.log('[FCM SW] Push event received:', event);

  let title = 'SleepCycle';
  let body = 'Hora de dormir!';
  let data = {};

  if (event.data) {
    // Get text first (can only read data once)
    const text = event.data.text();
    console.log('[FCM SW] Push data text:', text);

    try {
      // Try to parse as JSON (FCM format)
      const payload = JSON.parse(text);
      title = payload.notification?.title || payload.title || title;
      body = payload.notification?.body || payload.body || body;
      data = payload.data || {};
    } catch (e) {
      // Fallback to plain text (DevTools test)
      body = text || body;
    }
  }

  console.log('[FCM SW] Showing notification:', title, body);

  const options = {
    body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    vibrate: [200, 100, 200],
    tag: 'sleep-reminder-' + Date.now(),
    renotify: true,
    data: { url: data.url || '/', ...data },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[FCM SW] Notification shown successfully'))
      .catch(err => console.error('[FCM SW] Failed to show notification:', err))
  );
});

// Security: Validate URLs to prevent open redirect attacks
function isAllowedUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // Allow relative paths
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  // Allow same-origin URLs only
  try {
    const parsed = new URL(url, self.location.origin);
    return parsed.origin === self.location.origin;
  } catch {
    return false;
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'snooze') {
    // Snooze for 10 minutes - show notification again
    setTimeout(() => {
      self.registration.showNotification('SleepCycle - Lembrete', {
        body: 'Hora de dormir! (Soneca finalizada)',
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-96-96.png',
        vibrate: [200, 100, 200],
        tag: 'sleep-reminder-snooze',
        requireInteraction: true,
      });
    }, 10 * 60 * 1000); // 10 minutes
    return;
  }

  // Open or focus app - with URL validation
  const requestedUrl = event.notification.data?.url || '/';
  const urlToOpen = isAllowedUrl(requestedUrl) ? requestedUrl : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if app is already open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
