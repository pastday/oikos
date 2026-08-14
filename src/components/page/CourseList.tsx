import { Accordion, type AccordionItem } from "./Accordion";
import type { Course } from "@/content/courses";
import type { ProgramPageContent } from "@/content/pages";

type CurriculumLabels = ProgramPageContent["curriculum"];

/** 교과목 목록을 아코디언으로 보여준다. 학점 미표기·교과 내용 없음도 그대로 드러낸다. */
export function CourseList({
  courses,
  labels,
  idPrefix,
}: {
  courses: Course[];
  labels: CurriculumLabels;
  idPrefix: string;
}) {
  const items: AccordionItem[] = courses.map((course) => ({
    id: `${idPrefix}-${course.key}`,
    title: course.title,
    subtitle: course.titleAlt || undefined,
    meta:
      course.credits === null
        ? labels.creditsUnknown
        : `${course.credits} ${labels.creditsUnit}`,
    content: (
      <div className="space-y-3">
        <p>
          {course.description ?? (
            <span className="text-muted">{labels.descriptionPending}</span>
          )}
        </p>

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <div className="flex gap-1.5">
            <dt>{labels.formatLabel}</dt>
            <dd className="font-medium text-foreground/70">{course.format}</dd>
          </div>
        </dl>

        {course.altEnglishTitles && (
          <p className="rounded-md border-l-2 border-gold bg-beige px-4 py-3 text-xs leading-relaxed text-navy">
            {labels.altTitleNote}
            <br />
            {course.altEnglishTitles.join(" / ")}
          </p>
        )}
      </div>
    ),
  }));

  return <Accordion items={items} />;
}
