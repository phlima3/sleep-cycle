
// Permission request function for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Check if notifications are supported
export const areNotificationsSupported = (): boolean => {
  return "Notification" in window;
};

// Check current notification permission status
export const getNotificationPermission = (): NotificationPermission | null => {
  if (!areNotificationsSupported()) {
    return null;
  }
  return Notification.permission;
};

// Send a notification
export const sendNotification = (
  title: string, 
  options?: NotificationOptions
): Notification | null => {
  if (!areNotificationsSupported() || Notification.permission !== "granted") {
    return null;
  }
  
  try {
    // Create and return a new notification
    return new Notification(title, options);
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
};

// Schedule a sleep reminder notification
export const scheduleSleepReminder = (
  bedtime: Date,
  reminderMinutesBefore: number = 30
): void => {
  if (!areNotificationsSupported() || Notification.permission !== "granted") {
    console.log("Cannot schedule reminder: notifications not supported or permission not granted");
    return;
  }
  
  // Calculate when to show the notification
  const reminderTime = new Date(bedtime);
  reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutesBefore);
  
  const now = new Date();
  const timeUntilReminder = reminderTime.getTime() - now.getTime();
  
  if (timeUntilReminder <= 0) {
    console.log("Reminder time has already passed");
    return;
  }
  
  // Schedule the notification
  setTimeout(() => {
    sendNotification("Time to prepare for bed!", {
      body: `Your optimal bedtime is in ${reminderMinutesBefore} minutes`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      // Removing the vibrate property that was causing the TypeScript error
    });
  }, timeUntilReminder);
  
  console.log(`Sleep reminder scheduled for ${reminderTime.toLocaleTimeString()}`);
};

// Alias for the scheduleSleepReminder function
export const scheduleBedtimeNotification = (bedtime: string, reminderMinutesBefore: number = 30): void => {
  const bedtimeDate = new Date();
  const [hours, minutes] = bedtime.split(':').map(Number);
  
  bedtimeDate.setHours(hours, minutes, 0, 0);
  
  // If the bedtime is in the past (for today), set it for tomorrow
  if (bedtimeDate < new Date()) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }
  
  scheduleSleepReminder(bedtimeDate, reminderMinutesBefore);
};
