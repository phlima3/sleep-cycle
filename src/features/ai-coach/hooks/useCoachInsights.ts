import { useMemo } from 'react';
import { useSleepHistory } from '@/contexts/SleepHistoryContext';
import { getPrimaryInsight, generateInsights } from '../utils/insightGenerator';
import { analyzeSchedule } from '../utils/scheduleAnalysis';
import { MIN_ENTRIES_FOR_ANALYSIS } from '../constants';
import type { CoachInsight } from '../types';

interface UseCoachInsightsReturn {
  primaryInsight: CoachInsight;
  allInsights: CoachInsight[];
  hasEnoughData: boolean;
  consistencyScore: number | null;
}

export function useCoachInsights(): UseCoachInsightsReturn {
  const { history } = useSleepHistory();

  // Only analyze recent entries (last 14 days for relevance)
  const recentEntries = useMemo(() => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    return history.filter((entry) => new Date(entry.date) >= twoWeeksAgo);
  }, [history]);

  const insights = useMemo(() => {
    return generateInsights(recentEntries);
  }, [recentEntries]);

  const primaryInsight = useMemo(() => {
    return getPrimaryInsight(recentEntries);
  }, [recentEntries]);

  const stats = useMemo(() => {
    return analyzeSchedule(recentEntries);
  }, [recentEntries]);

  return {
    primaryInsight,
    allInsights: insights,
    hasEnoughData: recentEntries.length >= MIN_ENTRIES_FOR_ANALYSIS,
    consistencyScore: stats?.consistencyScore ?? null,
  };
}
