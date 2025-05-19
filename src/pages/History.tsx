import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSleepHistory } from "@/contexts/SleepHistoryContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useTranslation } from "react-i18next";

interface ChartData {
  date: string;
  cycles: number;
  duration: number;
}

const History = () => {
  const { history } = useSleepHistory();
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [dataRange, setDataRange] = useState<"week" | "month" | "all">("week");
  const { t } = useTranslation();

  // If no history, show a message
  if (history.length === 0) {
    return (
      <div className="page-container">
        <div className="w-full max-w-4xl px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">
            {t("history.title")}
          </h1>
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                {t("history.empty_state")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const prepareChartData = (): ChartData[] => {
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Filter by date range
    let filteredHistory = sortedHistory;
    const now = new Date();

    if (dataRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      filteredHistory = sortedHistory.filter(
        (entry) => new Date(entry.date) >= weekAgo
      );
    } else if (dataRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      filteredHistory = sortedHistory.filter(
        (entry) => new Date(entry.date) >= monthAgo
      );
    }

    // Transform data for charts
    return filteredHistory.map((entry) => {
      // Parse times to calculate duration
      const [bedHours, bedMinutes] = entry.bedtime.split(":").map(Number);
      const [wakeupHours, wakeupMinutes] = entry.wakeupTime
        .split(":")
        .map(Number);

      // Create JavaScript Date objects
      const bedtimeDate = new Date();
      bedtimeDate.setHours(bedHours, bedMinutes, 0, 0);

      const wakeupDate = new Date();
      wakeupDate.setHours(wakeupHours, wakeupMinutes, 0, 0);

      // If wakeup time is earlier than bedtime, assume it's the next day
      if (wakeupDate < bedtimeDate) {
        wakeupDate.setDate(wakeupDate.getDate() + 1);
      }

      // Calculate duration in hours
      const durationHours =
        (wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);

      // Format date for display
      const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      return {
        date: formattedDate,
        cycles: entry.completeCycles + entry.partialCycle,
        duration: parseFloat(durationHours.toFixed(1)),
      };
    });
  };

  const chartData = prepareChartData();

  return (
    <div className="page-container">
      <div className="w-full max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {t("history.title")}
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                dataRange === "week" ? "bg-primary text-white" : "bg-secondary"
              }`}
              onClick={() => setDataRange("week")}
            >
              {t("history.filters.time_range.week")}
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                dataRange === "month" ? "bg-primary text-white" : "bg-secondary"
              }`}
              onClick={() => setDataRange("month")}
            >
              {t("history.filters.time_range.month")}
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                dataRange === "all" ? "bg-primary text-white" : "bg-secondary"
              }`}
              onClick={() => setDataRange("all")}
            >
              {t("history.filters.time_range.all")}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                chartType === "bar" ? "bg-primary text-white" : "bg-secondary"
              }`}
              onClick={() => setChartType("bar")}
            >
              {t("history.filters.chart_type.bar")}
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                chartType === "line" ? "bg-primary text-white" : "bg-secondary"
              }`}
              onClick={() => setChartType("line")}
            >
              {t("history.filters.chart_type.line")}
            </button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("history.patterns.title")}</CardTitle>
            <CardDescription>
              {t("history.patterns.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cycles">
              <TabsList className="mb-6">
                <TabsTrigger value="cycles">
                  {t("history.patterns.tabs.cycles")}
                </TabsTrigger>
                <TabsTrigger value="duration">
                  {t("history.patterns.tabs.duration")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cycles" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 6]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="cycles"
                        name={t("history.patterns.charts.cycles.name")}
                        fill="#546BCA"
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 6]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cycles"
                        name={t("history.patterns.charts.cycles.name")}
                        stroke="#546BCA"
                        strokeWidth={2}
                        dot={{ fill: "#304692", r: 5 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="duration" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 12]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="duration"
                        name={t("history.patterns.charts.duration.name")}
                        fill="#9E5CF6"
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 12]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="duration"
                        name={t("history.patterns.charts.duration.name")}
                        stroke="#9E5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#9E5CF6", r: 5 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("history.recent_data.title")}</CardTitle>
            <CardDescription>
              {t("history.recent_data.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">
                      {t("history.recent_data.table.headers.date")}
                    </th>
                    <th className="text-left py-2 px-3">
                      {t("history.recent_data.table.headers.bedtime")}
                    </th>
                    <th className="text-left py-2 px-3">
                      {t("history.recent_data.table.headers.wakeup")}
                    </th>
                    <th className="text-left py-2 px-3">
                      {t("history.recent_data.table.headers.cycles")}
                    </th>
                    <th className="text-left py-2 px-3">
                      {t("history.recent_data.table.headers.ideal_bedtime")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((entry, index) => {
                    const date = new Date(entry.date);
                    const formattedDate = date.toLocaleDateString();

                    // Format times for display
                    const formatTime = (timeString: string) => {
                      const [hours, minutes] = timeString.split(":");
                      const time = new Date();
                      time.setHours(parseInt(hours), parseInt(minutes));
                      return time.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                    };

                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-3">{formattedDate}</td>
                        <td className="py-2 px-3">
                          {formatTime(entry.bedtime)}
                        </td>
                        <td className="py-2 px-3">
                          {formatTime(entry.wakeupTime)}
                        </td>
                        <td className="py-2 px-3">
                          {entry.completeCycles} +{" "}
                          {Math.round(entry.partialCycle * 100)}%
                        </td>
                        <td className="py-2 px-3">
                          {formatTime(entry.idealBedtime)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
