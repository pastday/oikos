import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { ProgramView } from "@/lib/cms/types";
import { BSection } from "@/components/site-b/BLayout";
import { BProgramFeature } from "@/components/site-b/BProgramFeature";
import { BHeadline, BLead } from "@/components/site-b/BType";

/**
 * 메인의 MBA · DBA 영역.
 *
 * 판 자체는 과정 허브(`/programs`)와 **같은 컴포넌트**를 쓴다.
 * 공개된 과정이 하나도 없으면 이 섹션을 그리지 않는다. (A안과 같은 규칙)
 */
export function BPrograms({
  locale,
  content,
  programs,
}: {
  locale: Locale;
  content: HomeContent;
  programs: ProgramView[];
}) {
  if (programs.length === 0) return null;

  return (
    <BSection index={3} label={content.programs.eyebrow} tone="paper">
      <div className="max-w-3xl">
        <BHeadline>{content.programs.title}</BHeadline>
        <BLead className="mt-6">{content.programs.description}</BLead>
      </div>

      <div className="mt-16">
        <BProgramFeature
          locale={locale}
          content={content}
          programs={programs}
        />
      </div>
    </BSection>
  );
}
