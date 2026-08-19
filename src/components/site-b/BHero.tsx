import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { MediaView } from "@/lib/cms/types";
import { BButton, BStatsBand } from "./BBlocks";
import { BFrame } from "./BFrame";
import { BContainer } from "./BLayout";
import { BDisplay, BEyebrow } from "./BType";
import { bPath } from "./paths";

/**
 * B안 메인 비주얼.
 *
 * ## 이전 시안이 왜 실패했는가
 *
 * 이전 B Hero 는 A안과 **정보를 쌓는 순서가 같았다.**
 * eyebrow → 기관명 → 제목 → 전공 → 학위 → CTA → 통계.
 * 글자를 키우고 배경에 gradient 를 깔았을 뿐 구조가 같으니 확대판으로 보였다.
 *
 * ## 지금 구조
 *
 * 화면을 **세로로 나눈다.**
 *
 *   왼쪽(약 58%)  글자. 아래쪽에 붙여 놓아 지면이 위에서 아래로 눌리는 느낌을 만든다.
 *   오른쪽(42%)   비주얼. 화면 위·오른쪽 끝까지 닿는다. **사진이 들어갈 자리다.**
 *   맨 아래       통계 띠가 두 칸을 가로질러 Hero 를 닫는다.
 *
 * A안에는 이런 좌우 분할도, 화면 끝까지 닿는 비주얼 영역도 없다.
 * 색을 모두 지워도 두 Hero 는 다른 구조로 읽힌다.
 *
 * ## 사진이 없을 때
 *
 * 오른쪽 자리는 비워 두지 않는다. `BFrame` 이 gradient·격자·워드마크로 면을 만든다.
 * 사진이 생기면 `backgroundMedia` 로 넘기기만 하면 같은 자리에 들어간다.
 * 영상으로 확장할 때도 이 자리의 배경 레이어만 바꾸면 된다.
 */
export function BHero({
  locale,
  content,
  watermark,
  backgroundMedia = null,
}: {
  locale: Locale;
  content: HomeContent;
  /** 비주얼 자리에 크게 깔 워드마크. 사전에서 받는다. */
  watermark: string;
  backgroundMedia?: MediaView | null;
}) {
  const { hero, facts } = content;

  return (
    <section className="relative flex min-h-svh flex-col bg-midnight text-white">
      {/* 오른쪽 비주얼 — 넓은 화면에서는 화면 오른쪽·위 끝까지 닿는다 */}
      <div className="absolute inset-y-0 right-0 hidden w-[42%] lg:block">
        <BFrame
          media={backgroundMedia}
          watermark={watermark}
          priority
          fill
          sizes="45vw"
        />
        {/* 글자 쪽으로 자연스럽게 어두워지게 한다. 사진이 들어와도 대비가 유지된다. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,15,1)_0%,rgba(4,8,15,0.35)_28%,transparent_60%)]"
        />
      </div>

      <BContainer className="relative flex flex-1 flex-col justify-end pt-32 pb-14 lg:pt-40 lg:pb-16 lg:pr-[46%]">
        <BEyebrow tone="dark">{hero.eyebrow}</BEyebrow>

        <p className="mt-8 font-serif text-lg tracking-[0.04em] text-white/70 sm:text-xl">
          {hero.university}
        </p>

        <BDisplay as="h1" tone="dark" className="mt-4 max-w-[16ch]">
          {hero.title}
        </BDisplay>

        {/* 전공 · 학위 · 온라인은 한 줄의 사실 목록으로 눕힌다.
            A안처럼 문단·배지로 흩어 놓지 않는다. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm tracking-[0.08em] text-white/75 sm:text-base">
          <span>{hero.major}</span>
          <span aria-hidden="true" className="h-4 w-px bg-white/25" />
          <span className="font-serif font-bold tracking-[0.16em] text-white">
            {hero.degrees}
          </span>
          <span aria-hidden="true" className="h-4 w-px bg-white/25" />
          <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
            {hero.online}
          </span>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BButton href={bPath(locale, "/programs")} tone="bronze">
            {hero.ctaPrograms}
          </BButton>
          <BButton href={bPath(locale, "/consultation")} tone="onDark">
            {hero.ctaConsultation}
          </BButton>
        </div>
      </BContainer>

      {/* 좁은 화면에서는 비주얼을 글자 아래에 눕힌다 */}
      <div className="relative lg:hidden">
        <BFrame
          media={backgroundMedia}
          watermark={watermark}
          ratio="16/9"
          sizes="100vw"
        />
      </div>

      {/*
        모집 자료의 핵심 정보. 값은 A안 메인과 **같은 콘텐츠**에서 온다.
        학기 수·개강 시점을 여기서 새로 적어 넣지 않는다.
      */}
      <div className="relative border-t border-white/15">
        <BContainer>
          <BStatsBand stats={facts} tone="dark" columns={4} />
        </BContainer>
      </div>
    </section>
  );
}
