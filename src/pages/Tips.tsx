import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Lightbulb, Moon, Home, Heart } from "lucide-react";

interface TipItemProps {
  number: number;
  title: string;
  description: string;
}

const TipItem = ({ number, title, description }: TipItemProps) => (
  <div className="p-4 rounded-base border-base border-bw bg-blank shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-base border-base border-bw bg-main text-main-foreground flex items-center justify-center font-bold text-lg shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

const Tips = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="w-full max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t("tips.title")}
          </h1>
          <p className="text-muted-foreground">Expert advice for better sleep</p>
        </div>

        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-8">
            <TabsTrigger value="before" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tips.tabs.before")}</span>
            </TabsTrigger>
            <TabsTrigger value="environment" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tips.tabs.environment")}</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tips.tabs.habits")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="before">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" strokeWidth={2.5} />
                  {t("tips.before_bed.title")}
                </CardTitle>
                <CardDescription>
                  {t("tips.before_bed.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TipItem
                  number={1}
                  title={t("tips.before_bed.tips.routine.title")}
                  description={t("tips.before_bed.tips.routine.description")}
                />
                <TipItem
                  number={2}
                  title={t("tips.before_bed.tips.screen_time.title")}
                  description={t("tips.before_bed.tips.screen_time.description")}
                />
                <TipItem
                  number={3}
                  title={t("tips.before_bed.tips.diet.title")}
                  description={t("tips.before_bed.tips.diet.description")}
                />
                <TipItem
                  number={4}
                  title={t("tips.before_bed.tips.lighting.title")}
                  description={t("tips.before_bed.tips.lighting.description")}
                />
                <TipItem
                  number={5}
                  title={t("tips.before_bed.tips.temperature.title")}
                  description={t("tips.before_bed.tips.temperature.description")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" strokeWidth={2.5} />
                  {t("tips.environment.title")}
                </CardTitle>
                <CardDescription>
                  {t("tips.environment.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TipItem
                  number={1}
                  title={t("tips.environment.tips.temperature.title")}
                  description={t("tips.environment.tips.temperature.description")}
                />
                <TipItem
                  number={2}
                  title={t("tips.environment.tips.darkness.title")}
                  description={t("tips.environment.tips.darkness.description")}
                />
                <TipItem
                  number={3}
                  title={t("tips.environment.tips.quiet.title")}
                  description={t("tips.environment.tips.quiet.description")}
                />
                <TipItem
                  number={4}
                  title={t("tips.environment.tips.bedding.title")}
                  description={t("tips.environment.tips.bedding.description")}
                />
                <TipItem
                  number={5}
                  title={t("tips.environment.tips.air_quality.title")}
                  description={t("tips.environment.tips.air_quality.description")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" strokeWidth={2.5} />
                  {t("tips.habits.title")}
                </CardTitle>
                <CardDescription>
                  {t("tips.habits.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TipItem
                  number={1}
                  title={t("tips.habits.tips.schedule.title")}
                  description={t("tips.habits.tips.schedule.description")}
                />
                <TipItem
                  number={2}
                  title={t("tips.habits.tips.daylight.title")}
                  description={t("tips.habits.tips.daylight.description")}
                />
                <TipItem
                  number={3}
                  title={t("tips.habits.tips.exercise.title")}
                  description={t("tips.habits.tips.exercise.description")}
                />
                <TipItem
                  number={4}
                  title={t("tips.habits.tips.substances.title")}
                  description={t("tips.habits.tips.substances.description")}
                />
                <TipItem
                  number={5}
                  title={t("tips.habits.tips.stress.title")}
                  description={t("tips.habits.tips.stress.description")}
                />
                <TipItem
                  number={6}
                  title={t("tips.habits.tips.naps.title")}
                  description={t("tips.habits.tips.naps.description")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tips;
