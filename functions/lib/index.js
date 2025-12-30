"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReminders = exports.deleteReminder = exports.saveReminder = exports.sendNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Send a push notification to a specific FCM token
 * Used for testing and immediate notifications
 */
exports.sendNotification = functions.https.onCall(async (data) => {
    const { token, title, body, data: extraData } = data;
    if (!token || !title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: token, title, body');
    }
    try {
        const message = {
            token,
            notification: {
                title,
                body,
            },
            data: extraData || {},
            webpush: {
                notification: {
                    icon: '/android/android-launchericon-192-192.png',
                    badge: '/android/android-launchericon-96-96.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true,
                },
            },
        };
        const response = await messaging.send(message);
        console.log('Notification sent successfully:', response);
        return { success: true, messageId: response };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
/**
 * Save or update a reminder in Firestore
 */
exports.saveReminder = functions.https.onCall(async (data) => {
    const { id, fcmToken, wakeUpTime, daysOfWeek, windDownMinutes, cycleLength, sleepLatency, enabled } = data;
    if (!fcmToken || !wakeUpTime) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: fcmToken, wakeUpTime');
    }
    try {
        const reminderData = {
            fcmToken,
            wakeUpTime,
            daysOfWeek: daysOfWeek || [1, 2, 3, 4, 5],
            windDownMinutes: windDownMinutes || 30,
            cycleLength: cycleLength || 90,
            sleepLatency: sleepLatency || 15,
            enabled: enabled !== false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (id) {
            await db.collection('reminders').doc(id).set(reminderData, { merge: true });
            return { success: true, id };
        }
        else {
            const docRef = await db.collection('reminders').add(Object.assign(Object.assign({}, reminderData), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
            return { success: true, id: docRef.id };
        }
    }
    catch (error) {
        console.error('Error saving reminder:', error);
        throw new functions.https.HttpsError('internal', 'Failed to save reminder');
    }
});
/**
 * Delete a reminder from Firestore
 */
exports.deleteReminder = functions.https.onCall(async (data) => {
    const { id } = data;
    if (!id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing reminder id');
    }
    try {
        await db.collection('reminders').doc(id).delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting reminder:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete reminder');
    }
});
/**
 * Calculate bedtime based on wake up time and sleep cycles
 */
function calculateBedtime(wakeUpTime, cycleLength, sleepLatency, cycles = 5) {
    const [hours, minutes] = wakeUpTime.split(':').map(Number);
    const wakeUp = new Date();
    wakeUp.setHours(hours, minutes, 0, 0);
    // If wake up time is earlier than now, it's for tomorrow
    if (wakeUp <= new Date()) {
        wakeUp.setDate(wakeUp.getDate() + 1);
    }
    // Calculate bedtime: wake time - (cycles * cycle length) - sleep latency
    const totalSleepMinutes = cycles * cycleLength;
    const bedtime = new Date(wakeUp.getTime() - (totalSleepMinutes + sleepLatency) * 60 * 1000);
    return bedtime;
}
/**
 * Scheduled function that runs every minute to check for due reminders
 * Requires Firebase Blaze plan
 */
exports.checkReminders = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    console.log(`[checkReminders] Running at ${now.toISOString()}, day: ${currentDay}`);
    try {
        // Get all enabled reminders for today
        const remindersSnapshot = await db
            .collection('reminders')
            .where('enabled', '==', true)
            .where('daysOfWeek', 'array-contains', currentDay)
            .get();
        if (remindersSnapshot.empty) {
            console.log('[checkReminders] No active reminders for today');
            return null;
        }
        const notifications = [];
        for (const doc of remindersSnapshot.docs) {
            const reminder = doc.data();
            // Calculate bedtime and notification time
            const bedtime = calculateBedtime(reminder.wakeUpTime, reminder.cycleLength, reminder.sleepLatency);
            const notifyTime = new Date(bedtime.getTime() - reminder.windDownMinutes * 60 * 1000);
            const notifyHour = notifyTime.getHours();
            const notifyMinute = notifyTime.getMinutes();
            // Check if notification should be sent now (within this minute)
            if (notifyHour === currentHour && notifyMinute === currentMinute) {
                const bedtimeStr = bedtime.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                });
                console.log(`[checkReminders] Sending notification to ${doc.id}, bedtime: ${bedtimeStr}`);
                const message = {
                    token: reminder.fcmToken,
                    notification: {
                        title: 'Hora de relaxar! 😴',
                        body: `Comece a se preparar para dormir. Horário ideal: ${bedtimeStr}`,
                    },
                    data: {
                        type: 'sleep-reminder',
                        bedtime: bedtimeStr,
                        reminderId: doc.id,
                    },
                    webpush: {
                        notification: {
                            icon: '/android/android-launchericon-192-192.png',
                            badge: '/android/android-launchericon-96-96.png',
                            vibrate: [200, 100, 200, 100, 200],
                            requireInteraction: true,
                            actions: [
                                { action: 'open', title: 'Abrir App' },
                                { action: 'snooze', title: 'Soneca 10min' },
                            ],
                        },
                    },
                };
                notifications.push(messaging.send(message).catch((error) => {
                    console.error(`[checkReminders] Failed to send to ${doc.id}:`, error);
                    return '';
                }));
            }
        }
        if (notifications.length > 0) {
            const results = await Promise.all(notifications);
            console.log(`[checkReminders] Sent ${results.filter(r => r).length} notifications`);
        }
        return null;
    }
    catch (error) {
        console.error('[checkReminders] Error:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map