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

const Tips = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="w-full max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {t("tips.title")}
        </h1>

        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-8">
            <TabsTrigger value="before">{t("tips.tabs.before")}</TabsTrigger>
            <TabsTrigger value="environment">
              {t("tips.tabs.environment")}
            </TabsTrigger>
            <TabsTrigger value="habits">{t("tips.tabs.habits")}</TabsTrigger>
          </TabsList>

          <TabsContent value="before">
            <Card>
              <CardHeader>
                <CardTitle>{t("tips.before_bed.title")}</CardTitle>
                <CardDescription>
                  {t("tips.before_bed.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">1</span>
                      </div>
                      {t("tips.before_bed.tips.routine.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.before_bed.tips.routine.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">2</span>
                      </div>
                      {t("tips.before_bed.tips.screen_time.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.before_bed.tips.screen_time.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">3</span>
                      </div>
                      {t("tips.before_bed.tips.diet.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.before_bed.tips.diet.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">4</span>
                      </div>
                      {t("tips.before_bed.tips.lighting.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.before_bed.tips.lighting.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">5</span>
                      </div>
                      {t("tips.before_bed.tips.temperature.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.before_bed.tips.temperature.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <Card>
              <CardHeader>
                <CardTitle>{t("tips.environment.title")}</CardTitle>
                <CardDescription>
                  {t("tips.environment.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">1</span>
                      </div>
                      {t("tips.environment.tips.temperature.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.environment.tips.temperature.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">2</span>
                      </div>
                      {t("tips.environment.tips.darkness.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.environment.tips.darkness.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">3</span>
                      </div>
                      {t("tips.environment.tips.quiet.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.environment.tips.quiet.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">4</span>
                      </div>
                      {t("tips.environment.tips.bedding.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.environment.tips.bedding.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">5</span>
                      </div>
                      {t("tips.environment.tips.air_quality.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.environment.tips.air_quality.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits">
            <Card>
              <CardHeader>
                <CardTitle>{t("tips.habits.title")}</CardTitle>
                <CardDescription>
                  {t("tips.habits.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">1</span>
                      </div>
                      {t("tips.habits.tips.schedule.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.schedule.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">2</span>
                      </div>
                      {t("tips.habits.tips.daylight.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.daylight.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">3</span>
                      </div>
                      {t("tips.habits.tips.exercise.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.exercise.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">4</span>
                      </div>
                      {t("tips.habits.tips.substances.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.substances.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">5</span>
                      </div>
                      {t("tips.habits.tips.stress.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.stress.description")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sleep-deep/20 flex items-center justify-center mr-2">
                        <span className="text-sleep-deep">6</span>
                      </div>
                      {t("tips.habits.tips.naps.title")}
                    </h3>
                    <p className="ml-10">
                      {t("tips.habits.tips.naps.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tips;
