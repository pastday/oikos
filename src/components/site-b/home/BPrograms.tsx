import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { ProgramView } from "@/lib/cms/types";
import { BFrame } from "@/components/site-b/BFrame";
import { designBImages } from "@/components/site-b/images";
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
  watermark,
}: {
  locale: Locale;
  content: HomeContent;
  programs: ProgramView[];
  watermark: string;
}) {
  if (programs.length === 0) return null;

  return (
    <BSection index={3} label={content.programs.eyebrow} tone="paper">
      <div className="max-w-3xl">
        <BHeadline>{content.programs.title}</BHeadline>
        <BLead className="mt-6">{content.programs.description}</BLead>
      </div>

      {/* 두 과정 위에 가로로 긴 사진 한 장을 깔아 이 구간의 성격을 먼저 전한다.
          아래 두 판은 글자 중심이라 사진이 정보를 가리지 않는다. */}
      <BFrame
        staticSrc={designBImages.programs}
        watermark={watermark}
        ratio="21/9"
        className="mt-14"
        sizes="(min-width: 1024px) 80rem, 100vw"
      />

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
