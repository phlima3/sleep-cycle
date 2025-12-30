import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { saveReminderToCloud, deleteReminderFromCloud } from '@/lib/reminderService';

interface Reminder {
  id: string;
  wakeUpTime: string; // HH:mm format
  enabled: boolean;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  windDownMinutes: number; // Minutes before bedtime to notify
  cloudId?: string; // Firestore document ID
}

interface UseRemindersReturn {
  reminders: Reminder[];
  nextBedtime: Date | null;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  calculateBedtime: (wakeUpTime: string, cycles: number) => Date;
  isSyncing: boolean;
}

const STORAGE_KEY = 'sleep-reminders';

export const useReminders = (): UseRemindersReturn => {
  const { settings } = useSettings();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [nextBedtime, setNextBedtime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReminders(JSON.parse(stored));
      } catch (e) {
        console.error('[Reminders] Failed to parse stored reminders:', e);
      }
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  // Calculate bedtime based on wake up time and desired cycles
  const calculateBedtime = useCallback((wakeUpTime: string, cycles: number = 5): Date => {
    const [hours, minutes] = wakeUpTime.split(':').map(Number);
    const wakeUp = new Date();
    wakeUp.setHours(hours, minutes, 0, 0);

    // If wake up time is earlier than now, it's for tomorrow
    if (wakeUp <= new Date()) {
      wakeUp.setDate(wakeUp.getDate() + 1);
    }

    // Calculate bedtime: wake time - (cycles * cycle length) - sleep latency
    const totalSleepMinutes = cycles * settings.cycleLength;
    const bedtime = new Date(wakeUp.getTime() - (totalSleepMinutes + settings.sleepLatency) * 60 * 1000);

    return bedtime;
  }, [settings.cycleLength, settings.sleepLatency]);

  // Find the next bedtime based on active reminders
  useEffect(() => {
    const activeReminders = reminders.filter(r => r.enabled);
    if (activeReminders.length === 0) {
      setNextBedtime(null);
      return;
    }

    const now = new Date();
    const today = now.getDay();

    let closestBedtime: Date | null = null;

    for (const reminder of activeReminders) {
      // Check if today is an active day
      if (reminder.daysOfWeek.includes(today)) {
        const bedtime = calculateBedtime(reminder.wakeUpTime, 5);
        const notifyTime = new Date(bedtime.getTime() - reminder.windDownMinutes * 60 * 1000);

        // Only consider if notification time is in the future
        if (notifyTime > now) {
          if (!closestBedtime || notifyTime < closestBedtime) {
            closestBedtime = bedtime;
          }
        }
      }
    }

    setNextBedtime(closestBedtime);
  }, [reminders, calculateBedtime]);

  // Schedule local notifications
  useEffect(() => {
    if (!nextBedtime || Notification.permission !== 'granted') return;

    const activeReminder = reminders.find(r => r.enabled);
    if (!activeReminder) return;

    const notifyTime = new Date(nextBedtime.getTime() - activeReminder.windDownMinutes * 60 * 1000);
    const msUntilNotify = notifyTime.getTime() - Date.now();

    if (msUntilNotify <= 0 || msUntilNotify > 24 * 60 * 60 * 1000) return; // Max 24h

    console.log('[Reminders] Scheduling notification for:', notifyTime);

    const timeoutId = setTimeout(() => {
      const bedtimeStr = nextBedtime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Show notification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: 'Hora de relaxar! 😴',
          body: `Comece a se preparar para dormir. Horário ideal: ${bedtimeStr}`,
        });
      } else {
        new Notification('Hora de relaxar! 😴', {
          body: `Comece a se preparar para dormir. Horário ideal: ${bedtimeStr}`,
          icon: '/android/android-launchericon-192-192.png',
          badge: '/android/android-launchericon-96-96.png',
        });
      }
    }, msUntilNotify);

    return () => clearTimeout(timeoutId);
  }, [nextBedtime, reminders]);

  const addReminder = useCallback(async (reminder: Omit<Reminder, 'id'>) => {
    const localId = crypto.randomUUID();
    const newReminder: Reminder = {
      ...reminder,
      id: localId,
    };

    // Add locally first for immediate feedback
    setReminders(prev => [...prev, newReminder]);

    // Sync to cloud
    setIsSyncing(true);
    try {
      const cloudId = await saveReminderToCloud({
        id: localId,
        wakeUpTime: reminder.wakeUpTime,
        daysOfWeek: reminder.daysOfWeek,
        windDownMinutes: reminder.windDownMinutes,
        cycleLength: settings.cycleLength,
        sleepLatency: settings.sleepLatency,
        enabled: reminder.enabled,
      });

      if (cloudId) {
        setReminders(prev =>
          prev.map(r => r.id === localId ? { ...r, cloudId } : r)
        );
      }
    } catch (error) {
      console.error('[Reminders] Failed to sync to cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [settings.cycleLength, settings.sleepLatency]);

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    // Update locally first
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    // Find the reminder to sync
    const reminder = reminders.find(r => r.id === id);
    if (reminder?.cloudId) {
      setIsSyncing(true);
      try {
        await saveReminderToCloud({
          id: reminder.cloudId,
          wakeUpTime: updates.wakeUpTime || reminder.wakeUpTime,
          daysOfWeek: updates.daysOfWeek || reminder.daysOfWeek,
          windDownMinutes: updates.windDownMinutes || reminder.windDownMinutes,
          cycleLength: settings.cycleLength,
          sleepLatency: settings.sleepLatency,
          enabled: updates.enabled !== undefined ? updates.enabled : reminder.enabled,
        });
      } catch (error) {
        console.error('[Reminders] Failed to update in cloud:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [reminders, settings.cycleLength, settings.sleepLatency]);

  const removeReminder = useCallback(async (id: string) => {
    const reminder = reminders.find(r => r.id === id);

    // Remove locally first
    setReminders(prev => prev.filter(r => r.id !== id));

    // Delete from cloud if synced
    if (reminder?.cloudId) {
      setIsSyncing(true);
      try {
        await deleteReminderFromCloud(reminder.cloudId);
      } catch (error) {
        console.error('[Reminders] Failed to delete from cloud:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [reminders]);

  return {
    reminders,
    nextBedtime,
    addReminder,
    updateReminder,
    removeReminder,
    calculateBedtime,
    isSyncing,
  };
};
