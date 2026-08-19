import type { HomeContent } from "@/content/home";
import { BRowList, type BRow } from "@/components/site-b/BBlocks";
import { BFrame } from "@/components/site-b/BFrame";
import { BSection } from "@/components/site-b/BLayout";
import { BHeadline, BLead } from "@/components/site-b/BType";

/**
 * 전공의 네 영역 (호텔 · 외식 · 와인 · 관광).
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 같은 크기 판 4개를 2×2 격자에 넣었다. A안의 카드 4장과 구조가 같았다.
 * 지금은 **왼쪽에 세로로 긴 비주얼 자리, 오른쪽에 번호가 붙은 가로선 목록**이다.
 * 네 항목이 대등하게 늘어선 것이 아니라 위에서 아래로 읽히고,
 * 왼쪽 비주얼이 전공의 성격(호텔·와인)을 사진으로 받을 자리가 된다.
 *
 * 큰 낱말은 콘텐츠의 전공 이름을 그대로 쓴다.
 * 영문 표기를 따로 지어내지 않는다. 영어판에서는 영어 콘텐츠가 그대로 큰 낱말이 된다.
 */
export function BSpecialization({
  content,
  watermark,
}: {
  content: HomeContent;
  watermark: string;
}) {
  const { pillars } = content;

  const rows: BRow[] = pillars.items.map((pillar) => ({
    id: pillar.key,
    title: pillar.title,
    body: pillar.description,
  }));

  return (
    <BSection index={2} label={pillars.title} tone="stone">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <BHeadline>{pillars.title}</BHeadline>
            <BLead className="mt-6">{pillars.description}</BLead>

            <BFrame
              media={null}
              watermark={watermark}
              ratio="3/4"
              className="mt-10"
              sizes="(min-width: 1024px) 22rem, 100vw"
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <BRowList rows={rows} size="large" />
        </div>
      </div>
    </BSection>
  );
}
