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

      {/* 사진을 지면 폭 밖까지 늘려 화면 끝에 닿게 한다.
          컨테이너 안의 작은 사각형으로 두면 사진이 장식으로만 보인다. */}
      <BFrame
        staticSrc={designBImages.programs}
        watermark={watermark}
        ratio="21/9"
        className="mt-14 -mx-6 sm:-mx-10 lg:-mx-14"
        sizes="100vw"
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
