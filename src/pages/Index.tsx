import React, { useState } from "react";
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
import { Moon, Sunrise, Clock } from "lucide-react";

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

  // Set default wake-up time to 8:00 AM
  const defaultWakeup = "08:00";

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t("home.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("home.calculate.description")}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
              {t("home.calculate.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bedtime Input */}
            <div className="space-y-2">
              <Label htmlFor="bedtime" className="flex items-center gap-2 text-base font-bold uppercase">
                <Moon className="w-4 h-4" strokeWidth={2.5} />
                {t("home.calculate.bedtime_question")}
              </Label>
              <Input
                id="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="text-lg h-14 text-center font-bold"
                disabled={calculationType === "fromWakeup"}
              />
            </div>

            {/* Wakeup Input */}
            <div className="space-y-2">
              <Label htmlFor="wakeup" className="flex items-center gap-2 text-base font-bold uppercase">
                <Sunrise className="w-4 h-4" strokeWidth={2.5} />
                {t("home.calculate.wakeup_question")}
              </Label>
              <Input
                id="wakeup"
                type="time"
                value={wakeupTime}
                onChange={(e) => setWakeupTime(e.target.value)}
                className="text-lg h-14 text-center font-bold"
                disabled={calculationType === "fromBedtime"}
              />
            </div>

            {/* Sleep Latency Info */}
            <div className="p-4 rounded-base border-base border-bw bg-secondary">
              <p className="text-sm font-medium">
                {t("home.calculate.latency_label", {
                  minutes: settings.sleepLatency,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("home.calculate.latency_description")}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-14 text-lg" onClick={handleCalculate}>
              {t("home.calculate.calculate_button")}
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-main text-main-foreground">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{settings.cycleLength}</p>
              <p className="text-xs uppercase font-medium opacity-80">min/cycle</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{settings.sleepLatency}</p>
              <p className="text-xs uppercase font-medium opacity-80">min latency</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
