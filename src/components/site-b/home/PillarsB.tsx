import type { HomeContent } from "@/content/home";
import type { Pillar } from "@/content/home/types";
import { ContainerB } from "../ContainerB";
import { SectionHeadB } from "../SectionB";

/**
 * 호텔 · 외식 · 와인 · 관광.
 *
 * 전공의 성격이 가장 잘 드러나는 자리다. A안은 아이콘이 붙은 작은 카드 4개지만,
 * B안은 **화면 폭을 꽉 채운 큰 판 4개**로 두고 영문 표기를 크게 얹는다.
 * 사진이 없는 지금도 타이포그래피만으로 전공의 인상을 만들 수 있고,
 * 나중에 각 판에 사진이 들어가면 그대로 visual storytelling 이 된다. (13단계 지시 14항)
 *
 * 문구는 A안과 같은 콘텐츠에서 온다. 영문 라벨은 새 정보가 아니라
 * 이미 확정되어 있는 전공 구성(호텔·외식·와인·관광)의 영문 표기다.
 */

/** 큰 글자로 얹을 영문 표기. 콘텐츠의 `key` 와 1:1 로 대응한다. */
const displayLabel: Record<Pillar["key"], string> = {
  hotel: "HOTEL",
  foodservice: "FOODSERVICE",
  wine: "WINE",
  tourism: "TOURISM",
};

export function PillarsB({ content }: { content: HomeContent }) {
  const { pillars } = content;

  return (
    <section className="bg-ink py-20 text-white lg:py-32">
      <ContainerB>
        <SectionHeadB
          index={2}
          title={pillars.title}
          description={pillars.description}
          tone="dark"
        />

        <ul className="mt-16 grid gap-px bg-white/15 sm:grid-cols-2">
          {pillars.items.map((pillar) => (
            <li
              key={pillar.key}
              className="group relative overflow-hidden bg-ink px-8 py-12 transition-colors hover:bg-ink-2 lg:px-12 lg:py-16"
            >
              {/* 배경에 크게 깔리는 영문 표기. 장식이므로 스크린리더에서 숨긴다. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 right-4 font-serif text-6xl font-bold tracking-tight text-white/[0.06] transition-colors group-hover:text-white/[0.1] lg:text-8xl"
              >
                {displayLabel[pillar.key]}
              </span>

              <p className="relative text-[0.6875rem] font-semibold tracking-[0.24em] text-bronze-2 uppercase">
                {displayLabel[pillar.key]}
              </p>
              <h3 className="relative mt-5 font-serif text-2xl font-bold text-white lg:text-3xl">
                {pillar.title}
              </h3>
              <p className="relative mt-4 max-w-md text-sm leading-[1.9] text-white/65">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </ContainerB>
    </section>
  );
}
