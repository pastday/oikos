import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { CourseView } from "@/lib/cms/types";
import { BRowList, BTextLink, type BRow } from "@/components/site-b/BBlocks";
import { BSection } from "@/components/site-b/BLayout";
import { BHeadline, BLead } from "@/components/site-b/BType";
import { bPath } from "@/components/site-b/paths";

/**
 * 교육과정 미리보기.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 과목 6개를 3열 격자에 같은 크기 판으로 늘어놓았다. A안과 같은 구조다.
 * 지금은 **왼쪽에 제목이 머물고 오른쪽에 번호가 붙은 과목 목록이 흐른다.**
 * 과목 수가 늘거나 줄어도 같은 리듬이 유지되고, 실제 교과목 자료집처럼 읽힌다.
 *
 * 과목은 DB(`Course`)에서 오며 A안과 같은 조회 함수를 쓴다.
 * 보여줄 과목이 없으면 섹션 자체를 그리지 않는다.
 */
export function BCurriculum({
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

  const rows: BRow[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.titleAlt,
  }));

  return (
    <BSection index={4} label={curriculum.eyebrow} tone="paper">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <BHeadline>{curriculum.title}</BHeadline>
            <BLead className="mt-6">{curriculum.description}</BLead>

            <div className="mt-10">
              <BTextLink href={bPath(locale, "/programs")}>
                {curriculum.cta}
              </BTextLink>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <BRowList rows={rows} />
          <p className="mt-8 text-xs text-quiet">{curriculum.note}</p>
        </div>
      </div>
    </BSection>
  );
}
