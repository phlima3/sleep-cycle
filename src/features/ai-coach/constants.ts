// Minimum data requirements
export const MIN_ENTRIES_FOR_ANALYSIS = 3;
export const MIN_ENTRIES_FOR_TRENDS = 7;
export const MIN_ENTRIES_FOR_PATTERNS = 5;

// Variance thresholds (in minutes)
export const VARIANCE_THRESHOLDS = {
  EXCELLENT: 15,
  GOOD: 30,
  MODERATE: 60,
  POOR: 90,
  VERY_POOR: 120,
} as const;

// Weekend pattern detection (in minutes)
export const WEEKEND_SHIFT_THRESHOLD = 45;

// Consistency scoring weights
export const SCORING_WEIGHTS = {
  BEDTIME_VARIANCE: 0.4,
  WAKEUP_VARIANCE: 0.4,
  WEEKEND_CONSISTENCY: 0.2,
} as const;

// Days considered "weekend" (0 = Sunday, 6 = Saturday)
export const WEEKEND_DAYS = [0, 6] as const;

// Trend detection thresholds
export const TREND_THRESHOLD = 10; // Score change of 10+ points
