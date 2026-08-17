import { Accordion, type AccordionItem } from "./Accordion";
import type { ProgramPageContent } from "@/content/pages";
import type { CourseView } from "@/lib/cms/types";

type CurriculumLabels = ProgramPageContent["curriculum"];

/**
 * 교과목 목록을 아코디언으로 보여준다.
 *
 * 학점 미표기·교과 내용 없음을 감추지 않고 그대로 드러낸다.
 * 원본 자료에 없는 값을 화면에서 지어내지 않기 위한 것이다.
 *
 * 과목 데이터는 DB(`Course`)에서 온다. 관리자가 입력한 글이므로
 * HTML 로 렌더링하지 않고 줄바꿈만 CSS 로 살린다.
 */
export function CourseList({
  courses,
  labels,
  idPrefix,
}: {
  courses: CourseView[];
  labels: CurriculumLabels;
  idPrefix: string;
}) {
  const items: AccordionItem[] = courses.map((course) => ({
    id: `${idPrefix}-${course.id}`,
    title: course.title,
    subtitle: course.titleAlt ?? undefined,
    meta:
      course.credits === null
        ? labels.creditsUnknown
        : `${course.credits} ${labels.creditsUnit}`,
    content: course.description ? (
      <p className="whitespace-pre-line">{course.description}</p>
    ) : (
      <p className="text-muted">{labels.descriptionPending}</p>
    ),
  }));

  return <Accordion items={items} />;
}
