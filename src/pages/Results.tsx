import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { scheduleSleepReminder } from "@/utils/notificationUtils";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const { settings } = useSettings();
  const { toast } = useToast();
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
    latency,
    cycleLength,
    completeCycles,
    partialCycle,
    totalSleepMinutes,
    adjustedBedtime,
    idealBedtimes,
    idealWakeupTimes,
  } = results;

  console.log(completeCycles);

  // Calculate hours and minutes for display
  const hours = Math.floor(totalSleepMinutes / 60);
  const minutes = totalSleepMinutes % 60;

  // Format times for display (optional)
  const formatTimeForDisplay = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return timeString;
    }
  };

  // Handle setting up a notification
  const handleSetupNotification = () => {
    if (idealBedtimes.length > 0) {
      scheduleSleepReminder(new Date(idealBedtimes[0]), 30);
      toast({
        title: t("results.notification.scheduled"),
        description: t("results.notification.reminder_info", {
          time: formatTimeForDisplay(idealBedtimes[0]),
        }),
      });
    }
  };

  // Determine quality of sleep based on number of complete cycles
  const getSleepQuality = (cycles: number) => {
    if (cycles >= 5) return t("results.quality.excellent");
    if (cycles >= 4) return t("results.quality.good");
    if (cycles >= 3) return t("results.quality.adequate");
    return t("results.quality.poor");
  };

  return (
    <div className="page-container">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {t("results.title")}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("results.summary")}</CardTitle>
            <CardDescription>
              {t("results.based_on", {
                bedtime: formatTimeForDisplay(bedtime),
                wakeup: formatTimeForDisplay(wakeupTime),
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">
                  {t("results.total_duration")}
                </h3>
                <p className="text-2xl font-bold">
                  {hours}h {minutes}m
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{t("results.sleep_cycles")}</h3>
                  <span className="text-sm">
                    {t("results.complete_cycles", {
                      complete: completeCycles,
                      partial: Math.round(partialCycle * 100),
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    if (i < Math.floor(completeCycles)) {
                      return (
                        <div key={i} className="h-3 rounded bg-sleep-deep" />
                      );
                    }
                    if (i === Math.floor(completeCycles) && partialCycle > 0) {
                      return (
                        <div
                          key={i}
                          className="h-3 rounded bg-gradient-to-r from-sleep-deep to-yellow-400"
                        />
                      );
                    }
                    return <div key={i} className="h-3 rounded bg-muted" />;
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("results.quality.poor")}</span>
                  <span>{t("results.quality.adequate")}</span>
                  <span>{t("results.quality.excellent")}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  {t("results.quality.title")}
                </h3>
                <p className="text-lg font-semibold">
                  {getSleepQuality(completeCycles)}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  {t("results.suggestion.title")}
                </h3>
                {completeCycles < 5 ? (
                  <p>
                    {t("results.suggestion.need_more", {
                      time: formatTimeForDisplay(adjustedBedtime),
                    })}
                  </p>
                ) : (
                  <p>{t("results.suggestion.optimal")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("results.ideal_bedtimes")}</CardTitle>
            <CardDescription>
              {t("results.for_wakeup", {
                time: formatTimeForDisplay(wakeupTime),
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {idealBedtimes.map((time, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {formatTimeForDisplay(time)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("results.cycles", { count: 5 - index })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/", { state: { bedtime: time, wakeupTime } });
                    }}
                  >
                    {t("results.actions.select")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("results.ideal_wakeuptimes")}</CardTitle>
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
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {formatTimeForDisplay(time)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("results.cycles", { count: index + 3 })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/", { state: { bedtime, wakeupTime: time } });
                    }}
                  >
                    {t("results.actions.select")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" onClick={() => navigate("/")}>
            {t("results.actions.new_calculation")}
          </Button>

          {/* {settings.notificationsEnabled && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleSetupNotification}
            >
              {t("results.actions.remind_me")}
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Results;
