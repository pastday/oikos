import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { BTextLink } from "@/components/site-b/BBlocks";
import { BContainer } from "@/components/site-b/BLayout";
import { BEyebrow } from "@/components/site-b/BType";
import { bPath } from "@/components/site-b/paths";

/**
 * 학위 및 인증으로 넘어가는 띠.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 제목·설명·버튼을 좌우로 나눈 어두운 띠였다. A안과 배치가 같았다.
 * 지금은 **한 줄짜리 가로 띠**다. 왼쪽에 라벨, 가운데에 제목 한 줄, 오른쪽에 링크.
 * 앞뒤 섹션이 모두 큰 덩어리라 여기서 한 번 숨을 돌리게 하는 자리다.
 *
 * 인증 기관 로고는 프로젝트에 제공된 적이 없어 넣지 않는다.
 * 인터넷에서 내려받지 않는다. 세부 내용은 학위/인증 페이지에서 다룬다.
 */
export function BDegreeStrip({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { degree } = content;

  return (
    <section className="bg-ink py-14 text-white lg:py-16">
      <BContainer>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-3">
            <BEyebrow tone="dark">{degree.eyebrow}</BEyebrow>
          </div>

          <div className="lg:col-span-6">
            <h2 className="font-serif text-2xl leading-snug font-bold text-balance sm:text-3xl">
              {degree.title}
            </h2>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-[1.85] text-white/65">
              {degree.description}
            </p>
          </div>

          <div className="lg:col-span-3 lg:text-right">
            <BTextLink href={bPath(locale, "/degree")} tone="dark">
              {degree.cta}
            </BTextLink>
          </div>
        </div>
      </BContainer>
    </section>
  );
}
