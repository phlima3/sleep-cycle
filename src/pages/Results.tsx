import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Moon, Clock, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

interface SleepResults {
  bedtime: string;
  wakeupTime: string;
  latency: number;
  cycleLength: number;
  completeCycles: number;
  partialCycle: number;
  totalSleepMinutes: number;
  adjustedBedtime: string;
  idealBedtimes: string[];
  idealWakeupTimes: string[];
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get calculation results from navigation state
  const results = location.state as SleepResults;

  React.useEffect(() => {
    if (!results) {
      navigate("/", { replace: true });
    }
  }, [navigate, results]);

  if (!results) {
    return null;
  }

  const {
    bedtime,
    wakeupTime,
    completeCycles,
    partialCycle,
    totalSleepMinutes,
    adjustedBedtime,
    idealWakeupTimes,
  } = results;

  // Calculate hours and minutes for display
  const hours = Math.floor(totalSleepMinutes / 60);
  const minutes = totalSleepMinutes % 60;

  // Format times for display
  const formatTimeForDisplay = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  // Determine quality of sleep based on number of complete cycles
  const getSleepQuality = (cycles: number) => {
    if (cycles >= 5) return { label: t("results.quality.excellent"), variant: "default" as const, color: "bg-green-500" };
    if (cycles >= 4) return { label: t("results.quality.good"), variant: "default" as const, color: "bg-main" };
    if (cycles >= 3) return { label: t("results.quality.adequate"), variant: "secondary" as const, color: "bg-yellow-400" };
    return { label: t("results.quality.poor"), variant: "destructive" as const, color: "bg-destructive" };
  };

  const quality = getSleepQuality(completeCycles);

  return (
    <div className="page-container">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t("results.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("results.based_on", {
              bedtime: formatTimeForDisplay(bedtime),
              wakeup: formatTimeForDisplay(wakeupTime),
            })}
          </p>
        </div>

        {/* Main Results Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" strokeWidth={2.5} />
              {t("results.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Duration */}
            <div className="text-center p-6 rounded-base border-base border-bw bg-main text-main-foreground">
              <p className="text-5xl font-bold">
                {hours}h {minutes}m
              </p>
              <p className="text-sm uppercase font-medium mt-2 opacity-80">
                {t("results.total_duration")}
              </p>
            </div>

            {/* Sleep Cycles Visual */}
            <div>
              <div className="flex justify-between mb-3">
                <h3 className="font-bold uppercase">{t("results.sleep_cycles")}</h3>
                <Badge variant={quality.variant}>
                  {t("results.complete_cycles", {
                    complete: completeCycles,
                    partial: Math.round(partialCycle * 100),
                  })}
                </Badge>
              </div>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {Array.from({ length: 6 }).map((_, i) => {
                  const isComplete = i < Math.floor(completeCycles);
                  const isPartial = i === Math.floor(completeCycles) && partialCycle > 0;

                  return (
                    <div
                      key={i}
                      className={`h-12 rounded-base border-base border-bw flex items-center justify-center font-bold transition-all ${
                        isComplete
                          ? "bg-main text-main-foreground shadow-shadow"
                          : isPartial
                          ? "bg-yellow-400 text-black shadow-shadow"
                          : "bg-secondary"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs uppercase font-medium text-muted-foreground">
                <span>{t("results.quality.poor")}</span>
                <span>{t("results.quality.adequate")}</span>
                <span>{t("results.quality.excellent")}</span>
              </div>
            </div>

            {/* Quality Badge */}
            <div className="p-4 rounded-base border-base border-bw bg-secondary">
              <h3 className="font-bold uppercase mb-2">{t("results.quality.title")}</h3>
              <Badge variant={quality.variant} className="text-base px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                {quality.label}
              </Badge>
            </div>

            {/* Suggestion */}
            <div className="p-4 rounded-base border-base border-bw bg-blank">
              <h3 className="font-bold uppercase mb-2">{t("results.suggestion.title")}</h3>
              {completeCycles < 5 ? (
                <p className="text-sm">
                  {t("results.suggestion.need_more", {
                    time: formatTimeForDisplay(adjustedBedtime),
                  })}
                </p>
              ) : (
                <p className="text-sm">{t("results.suggestion.optimal")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ideal Wake-up Times Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
              {t("results.ideal_wakeuptimes")}
            </CardTitle>
            <CardDescription>
              {t("results.for_bedtime", {
                time: formatTimeForDisplay(bedtime),
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {idealWakeupTimes.map((time, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-base border-base border-bw bg-blank shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                >
                  <div>
                    <p className="text-xl font-bold">
                      {formatTimeForDisplay(time)}
                    </p>
                    <p className="text-sm text-muted-foreground uppercase">
                      {t("results.cycles", { count: index + 3 })}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button className="w-full h-14 text-lg" onClick={() => navigate("/")}>
          <RotateCcw className="w-5 h-5 mr-2" />
          {t("results.actions.new_calculation")}
        </Button>
      </div>
    </div>
  );
};

export default Results;
