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
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="w-full max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {t("about.title")}
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("about.understanding.title")}</CardTitle>
            <CardDescription>
              {t("about.understanding.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{t("about.understanding.intro")}</p>

              <h3 className="text-lg font-semibold mt-6">
                {t("about.understanding.stages_title")}
              </h3>

              <div className="relative mt-4 p-4 rounded-lg bg-gradient-to-r from-sleep-light/10 to-sleep-dream/10 border overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sleep-light via-sleep-deep to-sleep-dream"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sleep-light">
                      {t("about.understanding.stages.light.title")}
                    </h4>
                    <p className="text-sm mt-1">
                      {t("about.understanding.stages.light.description")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sleep-deep">
                      {t("about.understanding.stages.deep.title")}
                    </h4>
                    <p className="text-sm mt-1">
                      {t("about.understanding.stages.deep.description")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sleep-dream">
                      {t("about.understanding.stages.rem.title")}
                    </h4>
                    <p className="text-sm mt-1">
                      {t("about.understanding.stages.rem.description")}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6">{t("about.understanding.cycle_changes")}</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>{t("about.understanding.cycle_points.early")}</li>
                <li>{t("about.understanding.cycle_points.late")}</li>
                <li>{t("about.understanding.cycle_points.waking")}</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">
                {t("about.understanding.importance_title")}
              </h3>

              <p>{t("about.understanding.importance.aligning")}</p>

              <p className="mt-2">
                {t("about.understanding.importance.planning")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("about.research.title")}</CardTitle>
            <CardDescription>{t("about.research.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  {t("about.research.studies.duration.title")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    {t("about.research.studies.duration.content")}
                  </p>
                  <p className="mb-2">
                    {t("about.research.studies.duration.finding")}
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {t("about.research.studies.duration.reference")}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  {t("about.research.studies.age.title")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    {t("about.research.studies.age.content")}
                  </p>
                  <p className="mb-2">
                    {t("about.research.studies.age.finding")}
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {t("about.research.studies.age.reference")}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  {t("about.research.studies.performance.title")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    {t("about.research.studies.performance.content")}
                  </p>
                  <p className="mb-2">
                    {t("about.research.studies.performance.finding")}
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {t("about.research.studies.performance.reference")}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  {t("about.research.studies.tracking.title")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    {t("about.research.studies.tracking.content")}
                  </p>
                  <p className="mb-2">
                    {t("about.research.studies.tracking.finding")}
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {t("about.research.studies.tracking.reference")}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("about.app_info.title")}</CardTitle>
            <CardDescription>{t("about.app_info.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("about.app_info.intro")}</p>

            <h3 className="text-lg font-semibold mt-6">
              {t("about.app_info.how_it_works.title")}
            </h3>

            <p className="mt-2">
              {t("about.app_info.how_it_works.description")}
            </p>

            <p className="mt-2">{t("about.app_info.how_it_works.benefit")}</p>

            <h3 className="text-lg font-semibold mt-6">
              {t("about.app_info.limitations.title")}
            </h3>

            <p className="mt-2">{t("about.app_info.limitations.intro")}</p>

            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{t("about.app_info.limitations.points.variation")}</li>
              <li>{t("about.app_info.limitations.points.averages")}</li>
              <li>{t("about.app_info.limitations.points.factors")}</li>
            </ul>

            <p className="mt-4">{t("about.app_info.limitations.disclaimer")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
