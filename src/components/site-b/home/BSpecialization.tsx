import type { HomeContent } from "@/content/home";
import { BFrame } from "@/components/site-b/BFrame";
import { pillarImages } from "@/components/site-b/images";
import { BSection } from "@/components/site-b/BLayout";
import { BHeadline, BLead, BRule } from "@/components/site-b/BType";
import { cn } from "@/lib/cn";

/**
 * 전공의 네 영역 (호텔 · 외식 · 와인 · 관광).
 *
 * ## 배치
 *
 * 같은 크기 카드 4장으로 늘어놓지 않는다.
 * 항목마다 **사진과 글의 좌우가 뒤바뀌고 사진 폭도 달라진다.**
 * 지면이 위에서 아래로 지그재그로 읽히고, 네 영역이 대등하게 나열된 목록이 아니라
 * 하나씩 소개되는 편집물처럼 보인다.
 *
 * 사진은 전공의 성격을 가장 빨리 전하는 요소라 이 섹션에서 가장 크게 쓴다.
 * 큰 낱말은 콘텐츠의 전공 이름을 그대로 쓴다. 영문 표기를 따로 지어내지 않는다.
 */

/** 항목마다 사진 폭과 좌우를 다르게 둔다. 네 항목이 같은 리듬으로 보이지 않게 하려는 것이다. */
const layouts = [
  { image: "lg:col-span-5", text: "lg:col-span-7", flip: false },
  { image: "lg:col-span-4", text: "lg:col-span-8", flip: true },
  { image: "lg:col-span-6", text: "lg:col-span-6", flip: false },
  { image: "lg:col-span-4", text: "lg:col-span-8", flip: true },
] as const;

export function BSpecialization({
  content,
  watermark,
}: {
  content: HomeContent;
  watermark: string;
}) {
  const { pillars } = content;

  return (
    <BSection index={2} label={pillars.title} tone="stone">
      <div className="max-w-3xl">
        <BHeadline>{pillars.title}</BHeadline>
        <BLead className="mt-6">{pillars.description}</BLead>
      </div>

      <ol className="mt-16 space-y-16 lg:space-y-24">
        {pillars.items.map((pillar, index) => {
          const layout = layouts[index % layouts.length];

          return (
            <li key={pillar.key}>
              <BRule className="mb-10 bg-rule-2/60" />

              <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
                <div
                  className={cn(
                    layout.image,
                    layout.flip && "lg:order-2",
                  )}
                >
                  {/* 사진은 장식이다. 옆 글이 어떤 분야인지 이미 말하고 있으므로
                      대체 텍스트를 비워 화면 읽기 프로그램이 건너뛰게 한다. */}
                  <BFrame
                    staticSrc={pillarImages[pillar.key]}
                    watermark={watermark}
                    ratio="4/5"
                    sizes="(min-width: 1024px) 30rem, 100vw"
                  />
                </div>

                <div className={cn(layout.text, layout.flip && "lg:order-1")}>
                  <span
                    aria-hidden="true"
                    className="font-serif text-index font-bold tabular-nums text-bronze"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-5 font-serif text-3xl font-bold text-ink sm:text-4xl">
                    {pillar.title}
                  </h3>

                  <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.9] text-ink/75">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </BSection>
  );
}
