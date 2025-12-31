import type { SleepEntry } from '@/contexts/SleepHistoryContext';
import type { CoachInsight, InsightPriority, PatternResult, ScheduleStats } from '../types';
import { MIN_ENTRIES_FOR_ANALYSIS, VARIANCE_THRESHOLDS } from '../constants';
import { analyzeSchedule, minutesToTime } from './scheduleAnalysis';
import {
  detectWeekendPattern,
  detectTrend,
  detectConsistentStreak,
} from './patternDetection';

/**
 * Generate all applicable insights from sleep history
 */
export function generateInsights(entries: SleepEntry[]): CoachInsight[] {
  const insights: CoachInsight[] = [];

  // Insufficient data check
  if (entries.length < MIN_ENTRIES_FOR_ANALYSIS) {
    insights.push(createInsufficientDataInsight(entries.length));
    return insights;
  }

  const stats = analyzeSchedule(entries);
  if (!stats) return insights;

  // 1. Check schedule variance (high priority)
  const varianceInsight = generateVarianceInsight(stats);
  if (varianceInsight) insights.push(varianceInsight);

  // 2. Check weekend pattern
  const weekendPattern = detectWeekendPattern(stats);
  if (weekendPattern) {
    insights.push(createWeekendPatternInsight(weekendPattern, stats));
  }

  // 3. Check trends
  const trend = detectTrend(entries);
  if (trend) {
    insights.push(createTrendInsight(trend));
  }

  // 4. Check for consistent streaks (positive reinforcement)
  const streak = detectConsistentStreak(entries);
  if (streak && !varianceInsight) {
    insights.push(createStreakInsight(streak));
  }

  // Sort by priority
  return sortByPriority(insights);
}

/**
 * Get the single most important insight to display
 */
export function getPrimaryInsight(entries: SleepEntry[]): CoachInsight {
  const insights = generateInsights(entries);
  return insights[0] || createInsufficientDataInsight(entries.length);
}

function generateVarianceInsight(stats: ScheduleStats): CoachInsight | null {
  const avgVariance = (stats.bedtimeVarianceMinutes + stats.wakeupVarianceMinutes) / 2;

  if (avgVariance <= VARIANCE_THRESHOLDS.GOOD) {
    return null; // No issue
  }

  const severity: InsightPriority = avgVariance > VARIANCE_THRESHOLDS.POOR ? 'high' : 'medium';
  const targetTime = minutesToTime(stats.avgBedtimeMinutes);

  return {
    id: `variance-${Date.now()}`,
    category: 'schedule_variance',
    priority: severity,
    title: 'coach.insights.variance.title',
    message:
      avgVariance > VARIANCE_THRESHOLDS.POOR
        ? 'coach.insights.variance.message_high'
        : 'coach.insights.variance.message_moderate',
    data: {
      bedtimeVariance: stats.bedtimeVarianceMinutes,
      wakeupVariance: stats.wakeupVarianceMinutes,
      suggestedBedtime: targetTime,
    },
    actionable: true,
    dismissible: true,
    createdAt: new Date(),
  };
}

function createWeekendPatternInsight(
  pattern: PatternResult,
  stats: ScheduleStats
): CoachInsight {
  const direction = pattern.details.direction as string;
  const diff = pattern.details.bedtimeDiffMinutes as number;

  return {
    id: `weekend-${Date.now()}`,
    category: 'weekend_pattern',
    priority: diff > 90 ? 'high' : 'medium',
    title: 'coach.insights.weekend.title',
    message:
      direction === 'later'
        ? 'coach.insights.weekend.message_later'
        : 'coach.insights.weekend.message_earlier',
    data: {
      timeDifference: Math.round(diff),
      weekdayBedtime: minutesToTime(stats.weekdayAvgBedtime),
      weekendBedtime: minutesToTime(stats.weekendAvgBedtime),
    },
    actionable: true,
    dismissible: true,
    createdAt: new Date(),
  };
}

function createTrendInsight(trend: PatternResult): CoachInsight {
  const isImproving = trend.pattern === 'improving';

  return {
    id: `trend-${Date.now()}`,
    category: isImproving ? 'improving_trend' : 'declining_trend',
    priority: isImproving ? 'info' : 'medium',
    title: isImproving
      ? 'coach.insights.trend.improving_title'
      : 'coach.insights.trend.declining_title',
    message: isImproving
      ? 'coach.insights.trend.improving_message'
      : 'coach.insights.trend.declining_message',
    data: {
      currentScore: trend.details.recentScore,
      previousScore: trend.details.previousScore,
      change: isImproving ? trend.details.improvement : trend.details.decline,
    },
    actionable: !isImproving,
    dismissible: true,
    createdAt: new Date(),
  };
}

function createStreakInsight(streak: PatternResult): CoachInsight {
  return {
    id: `streak-${Date.now()}`,
    category: 'optimal_streak',
    priority: 'info',
    title: 'coach.insights.streak.title',
    message: 'coach.insights.streak.message',
    data: {
      days: streak.details.days,
      score: streak.details.score,
    },
    actionable: false,
    dismissible: true,
    createdAt: new Date(),
  };
}

function createInsufficientDataInsight(currentCount: number): CoachInsight {
  return {
    id: `insufficient-${Date.now()}`,
    category: 'insufficient_data',
    priority: 'info',
    title: 'coach.insights.insufficient.title',
    message: 'coach.insights.insufficient.message',
    data: {
      currentEntries: currentCount,
      requiredEntries: MIN_ENTRIES_FOR_ANALYSIS,
    },
    actionable: false,
    dismissible: false,
    createdAt: new Date(),
  };
}

function sortByPriority(insights: CoachInsight[]): CoachInsight[] {
  const priorityOrder: Record<InsightPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
    info: 3,
  };

  return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
