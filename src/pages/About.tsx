import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Info, BookOpen, Sparkles, AlertTriangle } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="w-full max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
            {t("about.title")}
          </h1>
          <p className="text-muted-foreground">Learn about sleep science</p>
        </div>

        {/* Understanding Sleep Cycles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" strokeWidth={2.5} />
              {t("about.understanding.title")}
            </CardTitle>
            <CardDescription>
              {t("about.understanding.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base">{t("about.understanding.intro")}</p>

            <div>
              <h3 className="text-lg font-bold uppercase mb-4">
                {t("about.understanding.stages_title")}
              </h3>

              <div className="rounded-base border-base border-bw overflow-hidden">
                {/* Gradient bar */}
                <div className="h-3 bg-gradient-to-r from-sleep-light via-sleep-deep to-sleep-dream"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary">
                  <div className="p-3 rounded-base border-base border-bw bg-blank">
                    <Badge className="mb-2 bg-sleep-light text-black">
                      {t("about.understanding.stages.light.title")}
                    </Badge>
                    <p className="text-sm">
                      {t("about.understanding.stages.light.description")}
                    </p>
                  </div>

                  <div className="p-3 rounded-base border-base border-bw bg-blank">
                    <Badge className="mb-2 bg-sleep-deep text-white">
                      {t("about.understanding.stages.deep.title")}
                    </Badge>
                    <p className="text-sm">
                      {t("about.understanding.stages.deep.description")}
                    </p>
                  </div>

                  <div className="p-3 rounded-base border-base border-bw bg-blank">
                    <Badge className="mb-2 bg-sleep-dream text-white">
                      {t("about.understanding.stages.rem.title")}
                    </Badge>
                    <p className="text-sm">
                      {t("about.understanding.stages.rem.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p>{t("about.understanding.cycle_changes")}</p>

            <ul className="space-y-2">
              {["early", "late", "waking"].map((point, i) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-base border-base border-bw bg-main text-main-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span>{t(`about.understanding.cycle_points.${point}`)}</span>
                </li>
              ))}
            </ul>

            <div>
              <h3 className="text-lg font-bold uppercase mb-3">
                {t("about.understanding.importance_title")}
              </h3>
              <p>{t("about.understanding.importance.aligning")}</p>
              <p className="mt-2">{t("about.understanding.importance.planning")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Research Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
              {t("about.research.title")}
            </CardTitle>
            <CardDescription>{t("about.research.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {["duration", "age", "performance", "tracking"].map((study, index) => (
                <AccordionItem key={study} value={`item-${index + 1}`}>
                  <AccordionTrigger>
                    {t(`about.research.studies.${study}.title`)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-4 rounded-base border-base border-bw bg-secondary">
                      <p>{t(`about.research.studies.${study}.content`)}</p>
                      <p>{t(`about.research.studies.${study}.finding`)}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="outline" className="text-xs">
                          Reference
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t(`about.research.studies.${study}.reference`)}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              {t("about.app_info.title")}
            </CardTitle>
            <CardDescription>{t("about.app_info.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>{t("about.app_info.intro")}</p>

            <div>
              <h3 className="text-lg font-bold uppercase mb-3">
                {t("about.app_info.how_it_works.title")}
              </h3>
              <p>{t("about.app_info.how_it_works.description")}</p>
              <p className="mt-2">{t("about.app_info.how_it_works.benefit")}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold uppercase mb-3">
                {t("about.app_info.limitations.title")}
              </h3>
              <p>{t("about.app_info.limitations.intro")}</p>

              <ul className="mt-3 space-y-2">
                {["variation", "averages", "factors"].map((point, i) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-base border-base border-bw bg-secondary flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{t(`about.app_info.limitations.points.${point}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-base border-base border-bw bg-yellow-100 dark:bg-yellow-900/30 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm">{t("about.app_info.limitations.disclaimer")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
