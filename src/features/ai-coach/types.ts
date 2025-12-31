// Insight categories by priority
export type InsightCategory =
  | 'schedule_variance'
  | 'weekend_pattern'
  | 'improving_trend'
  | 'declining_trend'
  | 'optimal_streak'
  | 'insufficient_data';

export type InsightPriority = 'high' | 'medium' | 'low' | 'info';

export interface CoachInsight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  message: string;
  data: Record<string, unknown>;
  actionable: boolean;
  dismissible: boolean;
  createdAt: Date;
}

export interface ScheduleStats {
  bedtimeVarianceMinutes: number;
  wakeupVarianceMinutes: number;
  avgBedtimeMinutes: number;
  avgWakeupMinutes: number;
  weekdayAvgBedtime: number;
  weekendAvgBedtime: number;
  weekdayAvgWakeup: number;
  weekendAvgWakeup: number;
  consistencyScore: number;
  dataPoints: number;
}

export interface PatternResult {
  pattern: 'weekend_shift' | 'irregular' | 'consistent' | 'improving' | 'declining';
  confidence: number;
  details: Record<string, unknown>;
}
