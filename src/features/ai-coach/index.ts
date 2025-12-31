// Components
export { CoachInsightCard } from './components/CoachInsightCard';
export { InsightIcon } from './components/InsightIcon';

// Hooks
export { useCoachInsights } from './hooks/useCoachInsights';

// Utils
export { analyzeSchedule, timeToMinutes, minutesToTime } from './utils/scheduleAnalysis';
export { generateInsights, getPrimaryInsight } from './utils/insightGenerator';
export {
  detectWeekendPattern,
  detectTrend,
  detectConsistentStreak,
} from './utils/patternDetection';

// Types
export type {
  CoachInsight,
  InsightCategory,
  InsightPriority,
  ScheduleStats,
  PatternResult,
} from './types';

// Constants
export {
  MIN_ENTRIES_FOR_ANALYSIS,
  MIN_ENTRIES_FOR_TRENDS,
  VARIANCE_THRESHOLDS,
  WEEKEND_SHIFT_THRESHOLD,
} from './constants';
