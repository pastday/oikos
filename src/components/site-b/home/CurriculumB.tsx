import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { CourseView } from "@/lib/cms/types";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB, SectionHeadB } from "../SectionB";

/**
 * 교육과정 미리보기.
 *
 * 과목은 DB(`Course`)에서 온다. **메인에는 대표 과목만** 두고 전체는 과정 상세로 보낸다.
 * A안과 같은 조회 함수(`getHomeCoursePreview`)를 쓰므로 두 안에 같은 과목이 나온다.
 * 보여줄 과목이 없으면 섹션 자체를 그리지 않는다.
 */
export function CurriculumB({
  locale,
  content,
  courses,
}: {
  locale: Locale;
  content: HomeContent;
  courses: CourseView[];
}) {
  const { curriculum } = content;

  if (courses.length === 0) return null;

  return (
    <section className="border-b border-rule bg-paper-2 py-20 lg:py-32">
      <ContainerB>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeadB
            index={4}
            eyebrow={curriculum.eyebrow}
            title={curriculum.title}
            description={curriculum.description}
          />

          <ButtonB
            href={bPath(locale, "/programs")}
            variant="outline"
            className="shrink-0"
          >
            {curriculum.cta}
          </ButtonB>
        </div>

        <ol className="mt-16 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <li key={course.id} className="bg-paper px-7 py-9">
              <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-serif text-lg leading-snug font-bold text-ink">
                {course.title}
              </h3>
              {course.titleAlt && (
                <p className="mt-2.5 text-xs leading-relaxed tracking-wide text-quiet">
                  {course.titleAlt}
                </p>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 text-xs text-quiet">{curriculum.note}</p>
      </ContainerB>
    </section>
  );
}
