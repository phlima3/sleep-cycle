import { useState, useEffect, useCallback } from 'react';
import {
  requestFCMToken,
  onForegroundMessage,
  getStoredFCMToken,
  removeFCMToken,
  isFirebaseConfigured,
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
  sendFirebaseConfigToSW: () => void;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    isLoading: false,
    token: null,
    error: null,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        isFirebaseConfigured();

      const storedToken = getStoredFCMToken();

      setState((prev) => ({
        ...prev,
        isSupported: supported,
        isEnabled: !!storedToken && Notification.permission === 'granted',
        token: storedToken,
      }));
    };

    checkSupport();
  }, []);

  // Send Firebase config to service worker
  const sendFirebaseConfigToSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          },
        });
      } catch (error) {
        console.error('[Push] Error sending config to SW:', error);
      }
    }
  }, []);

  // Register Firebase Messaging SW
  useEffect(() => {
    const registerFirebaseSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('[Push] Firebase SW registered');
          sendFirebaseConfigToSW();
        } catch (error) {
          console.error('[Push] Firebase SW registration failed:', error);
        }
      }
    };

    if (state.isSupported) {
      registerFirebaseSW();
    }
  }, [state.isSupported, sendFirebaseConfigToSW]);

  // Listen for foreground messages
  useEffect(() => {
    if (!state.isEnabled) return;

    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const data = payload as { notification?: { title?: string; body?: string } };
      toast({
        title: data.notification?.title || 'SleepCycle',
        description: data.notification?.body || 'Você recebeu uma notificação',
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.isEnabled, toast]);

  // Enable push notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = await requestFCMToken();

      if (token) {
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          token,
          isLoading: false,
        }));

        // Send config to SW
        sendFirebaseConfigToSW();

        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá lembretes de sono',
        });

        return true;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Não foi possível ativar as notificações',
      }));

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: 'Erro ao ativar notificações',
        description: errorMessage,
        variant: 'destructive',
      });

      return false;
    }
  }, [toast, sendFirebaseConfigToSW]);

  // Disable push notifications
  const disableNotifications = useCallback(() => {
    removeFCMToken();
    setState((prev) => ({
      ...prev,
      isEnabled: false,
      token: null,
    }));

    toast({
      title: 'Notificações desativadas',
      description: 'Você não receberá mais lembretes',
    });
  }, [toast]);

  return {
    ...state,
    enableNotifications,
    disableNotifications,
    sendFirebaseConfigToSW,
  };
};
