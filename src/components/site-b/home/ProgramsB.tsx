import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { ProgramView } from "@/lib/cms/types";
import { ContainerB } from "../ContainerB";
import { ProgramPanelsB } from "../ProgramPanelsB";
import { SectionHeadB } from "../SectionB";

/**
 * 메인의 MBA · DBA 영역.
 *
 * 공개된 과정이 하나도 없으면 이 섹션 자체를 그리지 않는다. (A안과 같은 규칙)
 * 패널은 과정 허브와 같은 컴포넌트를 쓴다.
 */
export function ProgramsB({
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
    <section className="border-b border-rule bg-paper-2 py-20 lg:py-32">
      <ContainerB>
        <SectionHeadB
          index={3}
          eyebrow={content.programs.eyebrow}
          title={content.programs.title}
          description={content.programs.description}
        />
      </ContainerB>

      <ContainerB className="mt-16">
        <ProgramPanelsB
          locale={locale}
          content={content}
          programs={programs}
        />
      </ContainerB>
    </section>
  );
}
