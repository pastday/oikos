import type { HomeContent } from "@/content/home";
import { BStatement } from "@/components/site-b/BBlocks";
import { BFrame } from "@/components/site-b/BFrame";
import { designBImages } from "@/components/site-b/images";

/**
 * 100% 온라인.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 배경에 흐린 큰 글자를 깔고 그 위에 A안과 같은 제목·본문·목록을 얹었다.
 * 장식이 하나 늘었을 뿐 구조는 같았다.
 *
 * 지금은 **`100%` 와 `ONLINE` 두 줄이 화면을 가로지르는 것 자체가 이 섹션의 내용**이다.
 * 오른쪽에 제목·설명·학기 일정이 작게 붙는다. 크기 차이로 무엇이 핵심인지 정한다.
 *
 * 큰 글자는 콘텐츠의 `badge`("100% ONLINE")를 두 조각으로 나눈 것이다.
 * 새 문구를 만들지 않았고, 나눌 수 없는 형태면 통째로 한 줄에 둔다.
 */
export function BOnline({
  content,
  watermark,
}: {
  content: HomeContent;
  watermark: string;
}) {
  const { online } = content;

  // "100% ONLINE" 을 첫 낱말과 나머지로 나눈다. 공백이 없으면 그대로 한 줄이다.
  const spaceAt = online.badge.indexOf(" ");
  const megaFirst =
    spaceAt === -1 ? online.badge : online.badge.slice(0, spaceAt);
  const megaSecond =
    spaceAt === -1 ? undefined : online.badge.slice(spaceAt + 1);

  return (
    <BStatement mega={megaFirst} megaSecondLine={megaSecond} tone="midnight">
      <h2 className="font-serif text-2xl leading-snug font-bold text-balance text-white sm:text-3xl">
        {online.title}
      </h2>

      <p className="mt-6 max-w-lg text-[0.9375rem] leading-[1.9] text-white/70">
        {online.description}
      </p>

      <h3 className="mt-12 text-[0.625rem] font-semibold tracking-[0.22em] text-bronze-2 uppercase">
        {online.scheduleTitle}
      </h3>

      <ul className="mt-5 border-t border-white/15">
        {online.schedule.map((item) => (
          <li
            key={item}
            className="border-b border-white/15 py-4 text-[0.9375rem] tracking-wide text-white/85"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* 이 섹션의 주인공은 큰 글자다. 사진은 아래에 작게 두어 거들기만 한다. */}
      <BFrame
        staticSrc={designBImages.online}
        watermark={watermark}
        ratio="16/9"
        className="mt-10"
        sizes="(min-width: 1024px) 28rem, 100vw"
      />
    </BStatement>
  );
}
