import type { HomeContent } from "@/content/home";
import { BRule } from "@/components/site-b/BBlocks";
import { BSection } from "@/components/site-b/BLayout";
import {
  BBody,
  BEyebrow,
  BHeadline,
  BPullQuote,
} from "@/components/site-b/BType";

/**
 * 대학원 · 전공 소개.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 왼쪽에 제목, 오른쪽에 본문을 놓았다. A안의 배치를 그대로 쓴 것이다.
 * 지금은 **첫 문단을 통째로 크게 세워 선언문처럼 두고**, 나머지 본문이 그 아래에서
 * 두 단으로 흐른다. 잡지 기사의 도입부와 같은 방식이라
 * 카드도 격자도 없이 지면만으로 인상이 만들어진다.
 *
 * 문구는 A안 메인과 **같은 콘텐츠**다. 의미를 바꾸거나 줄이지 않았고
 * 첫 문단을 크게 세운 것뿐이다.
 */
export function BIntro({ content }: { content: HomeContent }) {
  const { major } = content;
  const [lead, ...rest] = major.paragraphs;

  return (
    <BSection index={1} label={major.eyebrow} tone="paper">
      <BEyebrow className="lg:hidden">{major.eyebrow}</BEyebrow>

      {/* 제목은 작게, 첫 문단은 크게. 잡지 기사의 도입부와 같은 순서다. */}
      <BHeadline size="small" className="mt-6 lg:mt-0">
        {major.title}
      </BHeadline>

      {lead && <BPullQuote className="mt-8">{lead}</BPullQuote>}

      <BRule className="my-12 lg:my-16" />

      <BBody paragraphs={rest} columns={2} />

      {/* FICB 관련 안내. 본문과 같은 크기로 두되 위에 선을 그어 구분한다. */}
      <div className="mt-12 border-t border-rule pt-8">
        <p className="max-w-[62ch] text-[0.9375rem] leading-[1.85] text-quiet">
          {major.ficbNote}
        </p>
      </div>
    </BSection>
  );
}
