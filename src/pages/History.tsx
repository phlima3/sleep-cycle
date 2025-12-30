import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { History as HistoryIcon, BarChart3, TrendingUp, Calendar } from "lucide-react";

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
              {t("history.title")}
            </h1>
          </div>
          <Card>
            <CardContent className="py-16 text-center">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-xl font-bold uppercase mb-2">
                {t("history.empty_state")}
              </p>
              <p className="text-muted-foreground">
                Start tracking your sleep to see your patterns here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const prepareChartData = (): ChartData[] => {
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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

    return filteredHistory.map((entry) => {
      const [bedHours, bedMinutes] = entry.bedtime.split(":").map(Number);
      const [wakeupHours, wakeupMinutes] = entry.wakeupTime.split(":").map(Number);

      const bedtimeDate = new Date();
      bedtimeDate.setHours(bedHours, bedMinutes, 0, 0);

      const wakeupDate = new Date();
      wakeupDate.setHours(wakeupHours, wakeupMinutes, 0, 0);

      if (wakeupDate < bedtimeDate) {
        wakeupDate.setDate(wakeupDate.getDate() + 1);
      }

      const durationHours =
        (wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);

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

  const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      className={`px-4 py-2 text-sm font-bold uppercase rounded-base border-base border-bw transition-all ${
        active
          ? "bg-main text-main-foreground shadow-shadow"
          : "bg-blank hover:bg-secondary shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="page-container">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t("history.title")}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {history.length} entries
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <FilterButton active={dataRange === "week"} onClick={() => setDataRange("week")}>
              {t("history.filters.time_range.week")}
            </FilterButton>
            <FilterButton active={dataRange === "month"} onClick={() => setDataRange("month")}>
              {t("history.filters.time_range.month")}
            </FilterButton>
            <FilterButton active={dataRange === "all"} onClick={() => setDataRange("all")}>
              {t("history.filters.time_range.all")}
            </FilterButton>
          </div>

          <div className="flex gap-2">
            <FilterButton active={chartType === "bar"} onClick={() => setChartType("bar")}>
              <BarChart3 className="w-4 h-4" />
            </FilterButton>
            <FilterButton active={chartType === "line"} onClick={() => setChartType("line")}>
              <TrendingUp className="w-4 h-4" />
            </FilterButton>
          </div>
        </div>

        {/* Charts Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" strokeWidth={2.5} />
              {t("history.patterns.title")}
            </CardTitle>
            <CardDescription>
              {t("history.patterns.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cycles">
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="cycles" className="flex-1">
                  {t("history.patterns.tabs.cycles")}
                </TabsTrigger>
                <TabsTrigger value="duration" className="flex-1">
                  {t("history.patterns.tabs.duration")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cycles" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bw)" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--bw)" />
                      <YAxis domain={[0, 6]} stroke="var(--bw)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--blank)",
                          border: "2px solid var(--bw)",
                          borderRadius: "5px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="cycles"
                        name={t("history.patterns.charts.cycles.name")}
                        fill="var(--main)"
                        stroke="var(--bw)"
                        strokeWidth={2}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bw)" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--bw)" />
                      <YAxis domain={[0, 6]} stroke="var(--bw)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--blank)",
                          border: "2px solid var(--bw)",
                          borderRadius: "5px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cycles"
                        name={t("history.patterns.charts.cycles.name")}
                        stroke="var(--main)"
                        strokeWidth={3}
                        dot={{ fill: "var(--main)", stroke: "var(--bw)", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="duration" className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bw)" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--bw)" />
                      <YAxis domain={[0, 12]} stroke="var(--bw)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--blank)",
                          border: "2px solid var(--bw)",
                          borderRadius: "5px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="duration"
                        name={t("history.patterns.charts.duration.name")}
                        fill="#9E5CF6"
                        stroke="var(--bw)"
                        strokeWidth={2}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bw)" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--bw)" />
                      <YAxis domain={[0, 12]} stroke="var(--bw)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--blank)",
                          border: "2px solid var(--bw)",
                          borderRadius: "5px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="duration"
                        name={t("history.patterns.charts.duration.name")}
                        stroke="#9E5CF6"
                        strokeWidth={3}
                        dot={{ fill: "#9E5CF6", stroke: "var(--bw)", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" strokeWidth={2.5} />
              {t("history.recent_data.title")}
            </CardTitle>
            <CardDescription>
              {t("history.recent_data.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-base border-bw">
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">
                      {t("history.recent_data.table.headers.date")}
                    </th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">
                      {t("history.recent_data.table.headers.bedtime")}
                    </th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">
                      {t("history.recent_data.table.headers.wakeup")}
                    </th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">
                      {t("history.recent_data.table.headers.cycles")}
                    </th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">
                      {t("history.recent_data.table.headers.ideal_bedtime")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((entry, index) => {
                    const date = new Date(entry.date);
                    const formattedDate = date.toLocaleDateString();

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
                      <tr key={index} className="border-b border-bw/20 hover:bg-secondary transition-colors">
                        <td className="py-3 px-4 font-medium">{formattedDate}</td>
                        <td className="py-3 px-4">{formatTime(entry.bedtime)}</td>
                        <td className="py-3 px-4">{formatTime(entry.wakeupTime)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {entry.completeCycles} + {Math.round(entry.partialCycle * 100)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{formatTime(entry.idealBedtime)}</td>
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
