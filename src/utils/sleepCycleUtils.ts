
// Standard sleep cycle is 90 minutes
const DEFAULT_CYCLE_LENGTH = 90;

// Time format utilities
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const parseTimeString = (timeString: string): Date => {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};

// Calculate time difference in minutes
export const getMinutesDifference = (startTime: Date, endTime: Date): number => {
  // If end time is earlier than start time, assume it's the next day
  let diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  if (diff < 0) {
    diff += 24 * 60; // Add 24 hours in minutes
  }
  
  return diff;
};

// Calculate complete and partial sleep cycles
export const calculateSleepCycles = (
  bedtime: string,
  wakeupTime: string,
  latencyMinutes: number = 15,
  cycleLengthMinutes: number = DEFAULT_CYCLE_LENGTH
): {
  completeCycles: number;
  partialCycle: number;
  totalSleepMinutes: number;
  adjustedBedtime: string;
} => {
  // Parse times
  const bedtimeDate = parseTimeString(bedtime);
  const wakeupDate = parseTimeString(wakeupTime);
  
  // Account for sleep latency
  const actualSleepTime = new Date(bedtimeDate.getTime() + latencyMinutes * 60 * 1000);
  
  // Calculate total sleep time in minutes
  const totalSleepMinutes = getMinutesDifference(actualSleepTime, wakeupDate);
  
  // Calculate complete cycles
  const completeCycles = Math.floor(totalSleepMinutes / cycleLengthMinutes);
  
  // Calculate partial cycle (as a percentage)
  const remainingMinutes = totalSleepMinutes % cycleLengthMinutes;
  const partialCycle = remainingMinutes / cycleLengthMinutes;
  
  // Calculate ideal bedtime to achieve complete cycles
  const idealSleepMinutes = completeCycles * cycleLengthMinutes;
  const minutesToAdjust = totalSleepMinutes - idealSleepMinutes;
  
  // Adjust bedtime to align with complete cycles
  const adjustedBedtimeDate = new Date(bedtimeDate.getTime() + minutesToAdjust * 60 * 1000);
  
  return {
    completeCycles,
    partialCycle,
    totalSleepMinutes,
    adjustedBedtime: formatTime(adjustedBedtimeDate)
  };
};

// Calculate ideal bedtimes for given wake-up time
export const calculateIdealBedtimes = (
  wakeupTime: string,
  latencyMinutes: number = 15,
  cycleLengthMinutes: number = DEFAULT_CYCLE_LENGTH,
  numberOfOptions: number = 4
): string[] => {
  const wakeupDate = parseTimeString(wakeupTime);
  const idealTimes: string[] = [];
  
  for (let cycles = numberOfOptions; cycles > 0; cycles--) {
    // Calculate ideal sleep duration for this number of cycles
    const idealSleepMinutes = cycles * cycleLengthMinutes;
    
    // Calculate ideal bedtime (accounting for sleep latency)
    const idealSleepStartTime = new Date(
      wakeupDate.getTime() - idealSleepMinutes * 60 * 1000
    );
    
    const idealBedtime = new Date(
      idealSleepStartTime.getTime() - latencyMinutes * 60 * 1000
    );
    
    idealTimes.push(formatTime(idealBedtime));
  }
  
  return idealTimes;
};

// Calculate ideal wake-up times for given bedtime
export const calculateIdealWakeupTimes = (
  bedtime: string,
  latencyMinutes: number = 15,
  cycleLengthMinutes: number = DEFAULT_CYCLE_LENGTH,
  numberOfOptions: number = 4
): string[] => {
  const bedtimeDate = parseTimeString(bedtime);
  const actualSleepTime = new Date(bedtimeDate.getTime() + latencyMinutes * 60 * 1000);
  const idealTimes: string[] = [];
  
  for (let cycles = 3; cycles <= numberOfOptions + 2; cycles++) {
    // Calculate ideal sleep duration for this number of cycles
    const idealSleepMinutes = cycles * cycleLengthMinutes;
    
    // Calculate ideal wake-up time
    const idealWakeupTime = new Date(
      actualSleepTime.getTime() + idealSleepMinutes * 60 * 1000
    );
    
    idealTimes.push(formatTime(idealWakeupTime));
  }
  
  return idealTimes;
};

// Determine if a notification should be sent for the ideal bedtime
export const shouldSendBedtimeNotification = (
  idealBedtime: string,
  notificationLeadTime: number = 30
): boolean => {
  const now = new Date();
  const idealBedtimeDate = parseTimeString(idealBedtime);
  
  // Calculate minutes until ideal bedtime
  const minutesUntilBedtime = getMinutesDifference(now, idealBedtimeDate);
  
  // Should send notification if within the lead time window
  return minutesUntilBedtime <= notificationLeadTime && minutesUntilBedtime > 0;
};
