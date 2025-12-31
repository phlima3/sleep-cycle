import { AlertCircle, Calendar, TrendingUp, TrendingDown, Award, Info } from 'lucide-react';
import type { InsightCategory } from '../types';

const iconMap: Record<InsightCategory, React.ElementType> = {
  schedule_variance: AlertCircle,
  weekend_pattern: Calendar,
  improving_trend: TrendingUp,
  declining_trend: TrendingDown,
  optimal_streak: Award,
  insufficient_data: Info,
};

interface InsightIconProps {
  category: InsightCategory;
  className?: string;
}

export function InsightIcon({ category, className = 'w-5 h-5' }: InsightIconProps) {
  const Icon = iconMap[category];
  return <Icon className={className} strokeWidth={2.5} />;
}
