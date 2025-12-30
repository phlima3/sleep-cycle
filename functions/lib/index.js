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
// Constants for validation and rate limiting
const MAX_REMINDERS_PER_TOKEN = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_CALLS_PER_WINDOW = 20;
// Validation functions
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
function validateWakeUpTime(time) {
    return typeof time === 'string' && TIME_REGEX.test(time);
}
function validateDaysOfWeek(days) {
    if (!Array.isArray(days))
        return false;
    if (days.length === 0 || days.length > 7)
        return false;
    return days.every(d => typeof d === 'number' && d >= 0 && d <= 6);
}
function validateNumericRange(value, min, max) {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}
function validateFcmToken(token) {
    return typeof token === 'string' && token.length > 20 && token.length < 500;
}
function validateReminderData(data) {
    if (!validateFcmToken(data.fcmToken)) {
        return 'Invalid FCM token';
    }
    if (!validateWakeUpTime(data.wakeUpTime)) {
        return 'Invalid wake up time format (expected HH:MM)';
    }
    if (data.daysOfWeek !== undefined && !validateDaysOfWeek(data.daysOfWeek)) {
        return 'Invalid days of week (expected array of 0-6)';
    }
    if (data.cycleLength !== undefined && !validateNumericRange(data.cycleLength, 60, 150)) {
        return 'Invalid cycle length (expected 60-150 minutes)';
    }
    if (data.sleepLatency !== undefined && !validateNumericRange(data.sleepLatency, 0, 60)) {
        return 'Invalid sleep latency (expected 0-60 minutes)';
    }
    if (data.windDownMinutes !== undefined && !validateNumericRange(data.windDownMinutes, 0, 120)) {
        return 'Invalid wind down time (expected 0-120 minutes)';
    }
    return null;
}
// Rate limiting helper
async function checkRateLimit(tokenHash) {
    const rateLimitRef = db.collection('rateLimits').doc(tokenHash);
    const now = Date.now();
    try {
        const result = await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(rateLimitRef);
            if (!doc.exists) {
                transaction.set(rateLimitRef, {
                    calls: 1,
                    windowStart: now,
                });
                return true;
            }
            const data = doc.data();
            const windowStart = data.windowStart;
            const calls = data.calls;
            // Reset window if expired
            if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
                transaction.update(rateLimitRef, {
                    calls: 1,
                    windowStart: now,
                });
                return true;
            }
            // Check if rate limit exceeded
            if (calls >= MAX_CALLS_PER_WINDOW) {
                return false;
            }
            // Increment call count
            transaction.update(rateLimitRef, {
                calls: calls + 1,
            });
            return true;
        });
        return result;
    }
    catch (error) {
        console.error('[RateLimit] Error:', error);
        return true; // Allow on error to prevent blocking legitimate users
    }
}
// Hash token for rate limiting (don't store full token)
function hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `token_${Math.abs(hash).toString(36)}`;
}
/**
 * Send a push notification to a specific FCM token
 * Rate limited to prevent abuse
 */
exports.sendNotification = functions.https.onCall(async (data) => {
    const { token, title, body, data: extraData } = data;
    // Validate required fields
    if (!validateFcmToken(token)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
    }
    if (typeof title !== 'string' || title.length === 0 || title.length > 100) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid title (1-100 chars)');
    }
    if (typeof body !== 'string' || body.length === 0 || body.length > 500) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid body (1-500 chars)');
    }
    // Rate limiting
    const tokenHash = hashToken(token);
    const allowed = await checkRateLimit(tokenHash);
    if (!allowed) {
        throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
    }
    try {
        const message = {
            token,
            notification: { title, body },
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
        return { success: true, messageId: response };
    }
    catch (error) {
        console.error('[sendNotification] Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
/**
 * Save or update a reminder in Firestore
 * Validates all input and enforces ownership
 */
exports.saveReminder = functions.https.onCall(async (data) => {
    var _a;
    const { id, fcmToken, wakeUpTime, daysOfWeek, windDownMinutes, cycleLength, sleepLatency, enabled } = data;
    // Validate input
    const validationError = validateReminderData({ fcmToken, wakeUpTime, daysOfWeek, cycleLength, sleepLatency, windDownMinutes });
    if (validationError) {
        throw new functions.https.HttpsError('invalid-argument', validationError);
    }
    // Rate limiting
    const tokenHash = hashToken(fcmToken);
    const allowed = await checkRateLimit(tokenHash);
    if (!allowed) {
        throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
    }
    try {
        // Check max reminders per token
        const existingReminders = await db.collection('reminders')
            .where('fcmToken', '==', fcmToken)
            .get();
        if (!id && existingReminders.size >= MAX_REMINDERS_PER_TOKEN) {
            throw new functions.https.HttpsError('resource-exhausted', `Maximum ${MAX_REMINDERS_PER_TOKEN} reminders allowed per device`);
        }
        const reminderData = {
            fcmToken,
            wakeUpTime,
            daysOfWeek: daysOfWeek || [1, 2, 3, 4, 5],
            windDownMinutes: windDownMinutes !== null && windDownMinutes !== void 0 ? windDownMinutes : 30,
            cycleLength: cycleLength !== null && cycleLength !== void 0 ? cycleLength : 90,
            sleepLatency: sleepLatency !== null && sleepLatency !== void 0 ? sleepLatency : 15,
            enabled: enabled !== false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (id) {
            // Verify ownership before update
            const existingDoc = await db.collection('reminders').doc(id).get();
            if (existingDoc.exists && ((_a = existingDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken) !== fcmToken) {
                throw new functions.https.HttpsError('permission-denied', 'Not authorized to update this reminder');
            }
            await db.collection('reminders').doc(id).set(reminderData, { merge: true });
            return { success: true, id };
        }
        else {
            const docRef = await db.collection('reminders').add(Object.assign(Object.assign({}, reminderData), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
            return { success: true, id: docRef.id };
        }
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError)
            throw error;
        console.error('[saveReminder] Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to save reminder');
    }
});
/**
 * Delete a reminder from Firestore
 * Verifies ownership before deletion
 */
exports.deleteReminder = functions.https.onCall(async (data) => {
    var _a;
    const { id, fcmToken } = data;
    if (!id || typeof id !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid reminder id');
    }
    if (!validateFcmToken(fcmToken)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
    }
    // Rate limiting
    const tokenHash = hashToken(fcmToken);
    const allowed = await checkRateLimit(tokenHash);
    if (!allowed) {
        throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
    }
    try {
        // Verify ownership before delete
        const doc = await db.collection('reminders').doc(id).get();
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Reminder not found');
        }
        if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken) !== fcmToken) {
            throw new functions.https.HttpsError('permission-denied', 'Not authorized to delete this reminder');
        }
        await db.collection('reminders').doc(id).delete();
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError)
            throw error;
        console.error('[deleteReminder] Error:', error);
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
    if (wakeUp <= new Date()) {
        wakeUp.setDate(wakeUp.getDate() + 1);
    }
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
    try {
        const remindersSnapshot = await db
            .collection('reminders')
            .where('enabled', '==', true)
            .where('daysOfWeek', 'array-contains', currentDay)
            .limit(500) // Prevent runaway queries
            .get();
        if (remindersSnapshot.empty) {
            return null;
        }
        const notifications = [];
        for (const doc of remindersSnapshot.docs) {
            const reminder = doc.data();
            // Validate stored data before use
            if (!validateWakeUpTime(reminder.wakeUpTime))
                continue;
            if (!validateFcmToken(reminder.fcmToken))
                continue;
            const bedtime = calculateBedtime(reminder.wakeUpTime, reminder.cycleLength || 90, reminder.sleepLatency || 15);
            const notifyTime = new Date(bedtime.getTime() - (reminder.windDownMinutes || 30) * 60 * 1000);
            const notifyHour = notifyTime.getHours();
            const notifyMinute = notifyTime.getMinutes();
            if (notifyHour === currentHour && notifyMinute === currentMinute) {
                const bedtimeStr = bedtime.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                });
                const message = {
                    token: reminder.fcmToken,
                    notification: {
                        title: 'Hora de relaxar! 😴',
                        body: `Comece a se preparar para dormir. Horário ideal: ${bedtimeStr}`,
                    },
                    data: {
                        type: 'sleep-reminder',
                        bedtime: bedtimeStr,
                    },
                    webpush: {
                        notification: {
                            icon: '/android/android-launchericon-192-192.png',
                            badge: '/android/android-launchericon-96-96.png',
                            vibrate: [200, 100, 200, 100, 200],
                            requireInteraction: true,
                        },
                    },
                };
                notifications.push(messaging.send(message).catch((error) => {
                    console.error(`[checkReminders] Failed to send:`, error);
                    return '';
                }));
            }
        }
        if (notifications.length > 0) {
            await Promise.all(notifications);
        }
        return null;
    }
    catch (error) {
        console.error('[checkReminders] Error:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map