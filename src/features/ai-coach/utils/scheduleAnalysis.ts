import type { SleepEntry } from '@/contexts/SleepHistoryContext';
import type { ScheduleStats } from '../types';
import {
  MIN_ENTRIES_FOR_ANALYSIS,
  VARIANCE_THRESHOLDS,
  SCORING_WEIGHTS,
  WEEKEND_DAYS,
} from '../constants';

/**
 * Convert HH:mm time to minutes from midnight
 * Times between 00:00-06:00 are treated as "next day" for bedtime calculations
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  // If time is between midnight and 6am, treat as "next day" for bedtime
  if (hours < 6) {
    totalMinutes += 24 * 60;
  }

  return totalMinutes;
}

/**
 * Convert minutes from midnight back to HH:mm format
 */
export function minutesToTime(minutes: number): string {
  // Handle "next day" times (> 24 hours)
  const normalizedMinutes = minutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate average of an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Check if a date falls on a weekend
 */
export function isWeekend(date: Date): boolean {
  return WEEKEND_DAYS.includes(date.getDay() as 0 | 6);
}

/**
 * Score consistency from 0-100 based on variance metrics
 */
function calculateConsistencyScore(
  bedtimeVar: number,
  wakeupVar: number,
  weekendDiff: number
): number {
  // Convert variance to 0-1 score (lower variance = higher score)
  const bedtimeScore = Math.max(0, 1 - bedtimeVar / VARIANCE_THRESHOLDS.VERY_POOR);
  const wakeupScore = Math.max(0, 1 - wakeupVar / VARIANCE_THRESHOLDS.VERY_POOR);
  const weekendScore = Math.max(0, 1 - weekendDiff / (VARIANCE_THRESHOLDS.POOR * 2));

  const weightedScore =
    bedtimeScore * SCORING_WEIGHTS.BEDTIME_VARIANCE +
    wakeupScore * SCORING_WEIGHTS.WAKEUP_VARIANCE +
    weekendScore * SCORING_WEIGHTS.WEEKEND_CONSISTENCY;

  return Math.round(weightedScore * 100);
}

/**
 * Main analysis function - calculates all schedule statistics
 */
export function analyzeSchedule(entries: SleepEntry[]): ScheduleStats | null {
  if (entries.length < MIN_ENTRIES_FOR_ANALYSIS) {
    return null;
  }

  const bedtimeMinutes = entries.map((e) => timeToMinutes(e.bedtime));
  const wakeupMinutes = entries.map((e) => timeToMinutes(e.wakeupTime));

  // Separate weekday vs weekend
  const weekdayEntries = entries.filter((e) => !isWeekend(new Date(e.date)));
  const weekendEntries = entries.filter((e) => isWeekend(new Date(e.date)));

  // Calculate variance (standard deviation in minutes)
  const bedtimeVariance = calculateStdDev(bedtimeMinutes);
  const wakeupVariance = calculateStdDev(wakeupMinutes);

  // Calculate averages
  const avgBedtime = calculateAverage(bedtimeMinutes);
  const avgWakeup = calculateAverage(wakeupMinutes);

  // Weekend/weekday averages (with fallbacks)
  const weekdayBedtimes = weekdayEntries.map((e) => timeToMinutes(e.bedtime));
  const weekendBedtimes = weekendEntries.map((e) => timeToMinutes(e.bedtime));
  const weekdayWakeups = weekdayEntries.map((e) => timeToMinutes(e.wakeupTime));
  const weekendWakeups = weekendEntries.map((e) => timeToMinutes(e.wakeupTime));

  const weekdayAvgBedtime =
    weekdayBedtimes.length > 0 ? calculateAverage(weekdayBedtimes) : avgBedtime;
  const weekendAvgBedtime =
    weekendBedtimes.length > 0 ? calculateAverage(weekendBedtimes) : avgBedtime;
  const weekdayAvgWakeup =
    weekdayWakeups.length > 0 ? calculateAverage(weekdayWakeups) : avgWakeup;
  const weekendAvgWakeup =
    weekendWakeups.length > 0 ? calculateAverage(weekendWakeups) : avgWakeup;

  // Calculate consistency score (0-100)
  const weekendBedtimeDiff = Math.abs(weekendAvgBedtime - weekdayAvgBedtime);
  const consistencyScore = calculateConsistencyScore(
    bedtimeVariance,
    wakeupVariance,
    weekendBedtimeDiff
  );

  return {
    bedtimeVarianceMinutes: Math.round(bedtimeVariance),
    wakeupVarianceMinutes: Math.round(wakeupVariance),
    avgBedtimeMinutes: Math.round(avgBedtime),
    avgWakeupMinutes: Math.round(avgWakeup),
    weekdayAvgBedtime: Math.round(weekdayAvgBedtime),
    weekendAvgBedtime: Math.round(weekendAvgBedtime),
    weekdayAvgWakeup: Math.round(weekdayAvgWakeup),
    weekendAvgWakeup: Math.round(weekendAvgWakeup),
    consistencyScore,
    dataPoints: entries.length,
  };
}
