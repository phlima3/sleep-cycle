import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeFirebase, getStoredFCMToken } from './firebase';

// Initialize Firebase Functions
const getFirebaseFunctions = () => {
  initializeFirebase();
  return getFunctions();
};

export interface ReminderData {
  id?: string;
  wakeUpTime: string;
  daysOfWeek: number[];
  windDownMinutes: number;
  cycleLength: number;
  sleepLatency: number;
  enabled: boolean;
}

/**
 * Save a reminder to Firestore via Cloud Function
 */
export const saveReminderToCloud = async (reminder: ReminderData): Promise<string | null> => {
  const fcmToken = getStoredFCMToken();
  if (!fcmToken) {
    console.error('[ReminderService] No FCM token available');
    return null;
  }

  try {
    const functions = getFirebaseFunctions();
    const saveReminder = httpsCallable<
      ReminderData & { fcmToken: string },
      { success: boolean; id: string }
    >(functions, 'saveReminder');

    const result = await saveReminder({
      ...reminder,
      fcmToken,
    });

    console.log('[ReminderService] Reminder saved:', result.data.id);
    return result.data.id;
  } catch (error) {
    console.error('[ReminderService] Failed to save reminder:', error);
    return null;
  }
};

/**
 * Delete a reminder from Firestore via Cloud Function
 */
export const deleteReminderFromCloud = async (id: string): Promise<boolean> => {
  try {
    const functions = getFirebaseFunctions();
    const deleteReminder = httpsCallable<{ id: string }, { success: boolean }>(
      functions,
      'deleteReminder'
    );

    await deleteReminder({ id });
    console.log('[ReminderService] Reminder deleted:', id);
    return true;
  } catch (error) {
    console.error('[ReminderService] Failed to delete reminder:', error);
    return false;
  }
};

/**
 * Send a test notification via Cloud Function
 */
export const sendTestNotification = async (
  title: string = 'SleepCycle - Teste',
  body: string = 'Notificação de teste funcionando!'
): Promise<boolean> => {
  const fcmToken = getStoredFCMToken();
  if (!fcmToken) {
    console.error('[ReminderService] No FCM token available');
    return false;
  }

  try {
    const functions = getFirebaseFunctions();
    const sendNotification = httpsCallable<
      { token: string; title: string; body: string },
      { success: boolean }
    >(functions, 'sendNotification');

    await sendNotification({ token: fcmToken, title, body });
    console.log('[ReminderService] Test notification sent');
    return true;
  } catch (error) {
    console.error('[ReminderService] Failed to send test notification:', error);
    return false;
  }
};
