import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { useSleepHistory } from "@/contexts/SleepHistoryContext";
import {
  calculateSleepCycles,
  calculateIdealBedtimes,
  calculateIdealWakeupTimes,
} from "@/utils/sleepCycleUtils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addEntry } = useSleepHistory();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get current time for default values
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Set default wake-up time to 8:00 AM if current time is before 8:00 AM,
  // otherwise set to 8:00 AM tomorrow
  const defaultWakeup = now.getHours() < 8 ? "08:00" : "08:00";

  const [bedtime, setBedtime] = useState(currentTime);
  const [wakeupTime, setWakeupTime] = useState(defaultWakeup);
  const [calculationType, setCalculationType] = useState<
    "normal" | "fromBedtime" | "fromWakeup"
  >("normal");

  const handleCalculate = () => {
    try {
      // Basic validation
      if (!bedtime || !wakeupTime) {
        toast({
          title: t("home.errors.missing_times.title"),
          description: t("home.errors.missing_times.description"),
          variant: "destructive",
        });
        return;
      }

      // Calculate sleep cycles
      const {
        completeCycles,
        partialCycle,
        totalSleepMinutes,
        adjustedBedtime,
      } = calculateSleepCycles(
        bedtime,
        wakeupTime,
        settings.sleepLatency,
        settings.cycleLength
      );

      // Calculate ideal bedtimes and wake-up times
      const idealBedtimes = calculateIdealBedtimes(
        wakeupTime,
        settings.sleepLatency,
        settings.cycleLength
      );

      const idealWakeupTimes = calculateIdealWakeupTimes(
        bedtime,
        settings.sleepLatency,
        settings.cycleLength
      );

      // Add to history
      addEntry({
        date: new Date().toISOString(),
        bedtime,
        wakeupTime,
        completeCycles,
        partialCycle,
        idealBedtime: idealBedtimes[0],
        idealWakeupTime: idealWakeupTimes[0],
      });

      // Navigate to results page with calculation data
      navigate("/results", {
        state: {
          bedtime,
          wakeupTime,
          latency: settings.sleepLatency,
          cycleLength: settings.cycleLength,
          completeCycles,
          partialCycle,
          totalSleepMinutes,
          adjustedBedtime,
          idealBedtimes,
          idealWakeupTimes,
        },
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: t("home.errors.calculation_error.title"),
        description: t("home.errors.calculation_error.description"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {t("home.title")}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("home.calculate.title")}</CardTitle>
            <CardDescription>{t("home.calculate.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-6 border rounded overflow-hidden">
              <Button
                variant={calculationType === "normal" ? "default" : "outline"}
                className="flex-1 rounded-none border-0"
                onClick={() => setCalculationType("normal")}
              >
                {t("home.calculation_types.normal")}
              </Button>
            </div>

            {calculationType === "normal" ||
            calculationType === "fromWakeup" ? (
              <div className="mb-4">
                <Label htmlFor="bedtime">
                  {t("home.calculate.bedtime_question")}
                </Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="mt-1"
                  disabled={calculationType === "fromWakeup"}
                />
              </div>
            ) : null}

            {calculationType === "normal" ||
            calculationType === "fromBedtime" ? (
              <div className="mb-4">
                <Label htmlFor="wakeup">
                  {t("home.calculate.wakeup_question")}
                </Label>
                <Input
                  id="wakeup"
                  type="time"
                  value={wakeupTime}
                  onChange={(e) => setWakeupTime(e.target.value)}
                  className="mt-1"
                  disabled={calculationType === "fromBedtime"}
                />
              </div>
            ) : null}

            <div className="mb-4">
              <Label>
                {t("home.calculate.latency_label", {
                  minutes: settings.sleepLatency,
                })}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("home.calculate.latency_description")}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleCalculate}>
              {t("home.calculate.calculate_button")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
