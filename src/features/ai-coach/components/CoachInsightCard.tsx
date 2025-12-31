import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoachInsights } from '../hooks/useCoachInsights';
import { InsightIcon } from './InsightIcon';
import type { InsightPriority } from '../types';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoachInsightCardProps {
  className?: string;
  onDismiss?: (insightId: string) => void;
  onSeeMore?: () => void;
}

export function CoachInsightCard({ className, onDismiss, onSeeMore }: CoachInsightCardProps) {
  const { t } = useTranslation();
  const { primaryInsight, consistencyScore } = useCoachInsights();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if dismissed
  if (isDismissed && primaryInsight.dismissible) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(primaryInsight.id);
  };

  // Determine card styling based on priority
  const priorityStyles: Record<InsightPriority, string> = {
    high: 'border-destructive bg-destructive/5',
    medium: 'border-main bg-main/5',
    low: 'border-secondary',
    info: 'border-bw/50 bg-secondary/30',
  };

  const priorityBadgeVariant: Record<InsightPriority, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
    info: 'outline',
  };

  return (
    <Card
      className={cn('relative overflow-hidden', priorityStyles[primaryInsight.priority], className)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            {t('coach.card_title', 'Sleep Coach')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {consistencyScore !== null && (
              <Badge variant="outline" className="text-xs">
                {t('coach.score', { score: consistencyScore, defaultValue: `${consistencyScore}%` })}
              </Badge>
            )}
            {primaryInsight.dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 rounded-base hover:bg-secondary transition-colors"
                aria-label={t('common.dismiss', 'Dismiss')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-base bg-secondary/50">
            <InsightIcon category={primaryInsight.category} className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm mb-1">
              {t(primaryInsight.title, primaryInsight.data as Record<string, string>)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(primaryInsight.message, primaryInsight.data as Record<string, string>)}
            </p>
          </div>
        </div>

        {/* Action area */}
        {primaryInsight.actionable && (
          <div className="flex items-center justify-between pt-2 border-t border-bw/20">
            <Badge variant={priorityBadgeVariant[primaryInsight.priority]}>
              {t(`coach.priority.${primaryInsight.priority}`, primaryInsight.priority)}
            </Badge>
            {onSeeMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSeeMore}
                className="text-xs uppercase font-bold"
              >
                {t('coach.see_more', 'Ver Mais')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Insufficient data progress */}
        {primaryInsight.category === 'insufficient_data' && (
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{t('coach.progress', 'Progresso')}</span>
              <span>
                {primaryInsight.data.currentEntries as number} / {primaryInsight.data.requiredEntries as number}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-bw/30">
              <div
                className="h-full bg-main transition-all"
                style={{
                  width: `${
                    ((primaryInsight.data.currentEntries as number) /
                      (primaryInsight.data.requiredEntries as number)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
