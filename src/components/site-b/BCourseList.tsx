import type { ProgramPageContent } from "@/content/pages";
import type { CourseView } from "@/lib/cms/types";
import { BAccordion, type BAccordionItem } from "./BAccordion";

type CurriculumLabels = ProgramPageContent["curriculum"];

/**
 * 교과목 목록.
 *
 * **데이터와 규칙은 A안과 같다.** 같은 `Course` 레코드를 같은 순서로 보여주고,
 * 학점이 없으면 없다고, 교과 내용이 없으면 준비 중이라고 그대로 적는다.
 * 원본 자료에 없는 값을 화면에서 지어내지 않기 위한 정책이라 디자인과 무관하다.
 */
export function BCourseList({
  courses,
  labels,
  idPrefix,
}: {
  courses: CourseView[];
  labels: CurriculumLabels;
  idPrefix: string;
}) {
  const items: BAccordionItem[] = courses.map((course) => ({
    id: `${idPrefix}-${course.id}`,
    title: course.title,
    subtitle: course.titleAlt,
    meta:
      course.credits === null
        ? labels.creditsUnknown
        : `${course.credits} ${labels.creditsUnit}`,
    content: course.description ? (
      // 관리자가 입력한 글이다. HTML 로 렌더링하지 않고 줄바꿈만 살린다.
      <p className="max-w-[62ch] whitespace-pre-line">{course.description}</p>
    ) : (
      <p className="text-quiet">{labels.descriptionPending}</p>
    ),
  }));

  return <BAccordion items={items} numbered />;
}
