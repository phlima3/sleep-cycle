import type { SleepEntry } from '@/contexts/SleepHistoryContext';
import type { PatternResult, ScheduleStats } from '../types';
import {
  MIN_ENTRIES_FOR_TRENDS,
  MIN_ENTRIES_FOR_PATTERNS,
  WEEKEND_SHIFT_THRESHOLD,
  TREND_THRESHOLD,
} from '../constants';
import { analyzeSchedule } from './scheduleAnalysis';

/**
 * Detect weekend vs weekday sleep pattern differences
 */
export function detectWeekendPattern(stats: ScheduleStats): PatternResult | null {
  const bedtimeDiff = Math.abs(stats.weekendAvgBedtime - stats.weekdayAvgBedtime);
  const wakeupDiff = Math.abs(stats.weekendAvgWakeup - stats.weekdayAvgWakeup);

  if (bedtimeDiff >= WEEKEND_SHIFT_THRESHOLD || wakeupDiff >= WEEKEND_SHIFT_THRESHOLD) {
    const isLaterOnWeekend = stats.weekendAvgBedtime > stats.weekdayAvgBedtime;

    return {
      pattern: 'weekend_shift',
      confidence: Math.min(1, Math.max(bedtimeDiff, wakeupDiff) / 90),
      details: {
        bedtimeDiffMinutes: Math.round(bedtimeDiff),
        wakeupDiffMinutes: Math.round(wakeupDiff),
        direction: isLaterOnWeekend ? 'later' : 'earlier',
      },
    };
  }

  return null;
}

/**
 * Detect improving or declining consistency trends
 * Compares recent entries (last ~30%) vs earlier entries
 */
export function detectTrend(entries: SleepEntry[]): PatternResult | null {
  if (entries.length < MIN_ENTRIES_FOR_TRENDS) {
    return null;
  }

  // Sort by date (newest first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Split into recent (~30%) and earlier (~70%)
  const splitIndex = Math.ceil(sorted.length * 0.3);
  const recentEntries = sorted.slice(0, Math.max(3, splitIndex));
  const earlierEntries = sorted.slice(splitIndex);

  if (earlierEntries.length < 3) {
    return null;
  }

  // Calculate variance for each group
  const recentStats = analyzeSchedule(recentEntries);
  const earlierStats = analyzeSchedule(earlierEntries);

  if (!recentStats || !earlierStats) return null;

  const scoreDiff = recentStats.consistencyScore - earlierStats.consistencyScore;

  // Significant improvement
  if (scoreDiff >= TREND_THRESHOLD) {
    return {
      pattern: 'improving',
      confidence: Math.min(1, scoreDiff / 30),
      details: {
        recentScore: recentStats.consistencyScore,
        previousScore: earlierStats.consistencyScore,
        improvement: scoreDiff,
      },
    };
  }

  // Significant decline
  if (scoreDiff <= -TREND_THRESHOLD) {
    return {
      pattern: 'declining',
      confidence: Math.min(1, Math.abs(scoreDiff) / 30),
      details: {
        recentScore: recentStats.consistencyScore,
        previousScore: earlierStats.consistencyScore,
        decline: Math.abs(scoreDiff),
      },
    };
  }

  return null;
}

/**
 * Detect consistent schedule streaks
 */
export function detectConsistentStreak(entries: SleepEntry[]): PatternResult | null {
  if (entries.length < MIN_ENTRIES_FOR_PATTERNS) {
    return null;
  }

  const stats = analyzeSchedule(entries);
  if (!stats) return null;

  // Excellent consistency for 5+ days
  if (stats.consistencyScore >= 80 && stats.dataPoints >= MIN_ENTRIES_FOR_PATTERNS) {
    return {
      pattern: 'consistent',
      confidence: stats.consistencyScore / 100,
      details: {
        score: stats.consistencyScore,
        days: stats.dataPoints,
      },
    };
  }

  return null;
}

/**
 * Detect irregular schedule pattern
 */
export function detectIrregularPattern(stats: ScheduleStats): PatternResult | null {
  const avgVariance = (stats.bedtimeVarianceMinutes + stats.wakeupVarianceMinutes) / 2;

  if (avgVariance >= 60) {
    return {
      pattern: 'irregular',
      confidence: Math.min(1, avgVariance / 120),
      details: {
        bedtimeVariance: stats.bedtimeVarianceMinutes,
        wakeupVariance: stats.wakeupVarianceMinutes,
        avgVariance: Math.round(avgVariance),
      },
    };
  }

  return null;
}
