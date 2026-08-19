import Image from "next/image";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { MediaView } from "@/lib/cms/types";
import { BButton } from "./BBlocks";
import { designBImages } from "./images";
import { BContainer } from "./BLayout";
import { BDisplay, BEyebrow } from "./BType";
import { bPath } from "./paths";

/**
 * B안 메인 비주얼.
 *
 * ## 이전 시안이 왜 부족했는가
 *
 * 사진을 **오른쪽 42% 패널에만** 넣었더니 화면이 칼로 자른 듯 둘로 갈렸다.
 * 왼쪽은 넓은 검은 사각형, 오른쪽은 사진. 사진이 레이아웃의 한 조각일 뿐이었다.
 *
 * ## 지금 구조
 *
 * 사진이 **Hero 전체를 덮는다.** 그 위에 왼쪽이 진하고 오른쪽으로 갈수록 옅어지는
 * 가로 gradient 를 얹어 글자를 읽히게 한다. 경계선이 없으므로 화면이 하나로 이어지고,
 * 왼쪽의 어두운 면도 "빈 상자"가 아니라 사진 위에 드리운 그늘로 읽힌다.
 *
 * 사진의 초점(건물)이 오른쪽에 오도록 `object-position` 을 오른쪽으로 밀었다.
 * 왼쪽은 어차피 gradient 로 덮이는 자리라 글자와 겹치지 않는다.
 *
 * 세로로는 위·아래를 한 번 더 눌러 둔다. 위는 투명한 Header 의 흰 글자를 위해,
 * 아래는 통계 띠가 사진 위에 얹히기 위해서다.
 *
 * ## 사진
 *
 * 시안용 CC0 이미지이며 오이코스대학교를 찍은 것이 아니다.
 * 관리자가 CMS 에서 Hero 이미지를 올리면 `backgroundMedia` 가 그것을 이긴다.
 */
export function BHero({
  locale,
  content,
  backgroundMedia = null,
}: {
  locale: Locale;
  content: HomeContent;
  backgroundMedia?: MediaView | null;
}) {
  const { hero, facts } = content;
  // 시안 이미지가 항상 있으므로 Hero 배경은 비지 않는다.
  // 관리자가 CMS 에서 올린 것이 있으면 그쪽이 이긴다.
  const background = backgroundMedia
    ? { src: backgroundMedia.url, alt: backgroundMedia.alt }
    : { src: designBImages.heroCampusWide, alt: "" };

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-midnight text-white">
      {/* 사진이 Hero 전체를 덮는다. 초점(건물)이 오른쪽에 오게 밀어 둔다. */}
      <Image
        src={background.src}
        alt={background.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center]"
      />

      {/* 왼쪽이 진하고 오른쪽으로 옅어지는 그늘. 글자가 놓이는 쪽만 덮는다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,15,0.96)_0%,rgba(4,8,15,0.90)_26%,rgba(4,8,15,0.62)_55%,rgba(4,8,15,0.30)_80%,rgba(4,8,15,0.18)_100%)]"
      />
      {/* 위(투명 Header)와 아래(통계 띠)를 한 번 더 눌러 준다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.70)_0%,rgba(4,8,15,0.10)_28%,rgba(4,8,15,0.15)_62%,rgba(4,8,15,0.80)_100%)]"
      />
      {/* 사진 위에 아주 옅게 남기는 금색 기운. 전체 색조를 사이트와 맞춘다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_88%_10%,rgba(168,130,63,0.20),transparent_60%)]"
      />

      <BContainer className="relative flex-1 pt-32 pb-14 lg:flex lg:flex-col lg:justify-center lg:pt-36 lg:pb-24">
        <div className="max-w-2xl lg:max-w-[54%]">
          <BEyebrow tone="dark">{hero.eyebrow}</BEyebrow>

          <p className="mt-7 font-serif text-lg tracking-[0.04em] text-white/80 sm:text-xl">
            {hero.university}
          </p>

          <BDisplay
            as="h1"
            tone="dark"
            className="mt-4 [text-shadow:0_2px_24px_rgba(4,8,15,0.55)]"
          >
            {hero.title}
          </BDisplay>

          {/* 전공 · 학위 · 온라인을 한 줄의 사실 목록으로 눕힌다. */}
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm tracking-[0.08em] text-white/85 sm:text-base">
            <span>{hero.major}</span>
            <span aria-hidden="true" className="h-4 w-px bg-white/30" />
            <span className="font-serif font-bold tracking-[0.16em] text-white">
              {hero.degrees}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-white/30" />
            <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
              {hero.online}
            </span>
          </div>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BButton href={bPath(locale, "/programs")} tone="bronze">
              {hero.ctaPrograms}
            </BButton>
            <BButton href={bPath(locale, "/consultation")} tone="onDark">
              {hero.ctaConsultation}
            </BButton>
          </div>
        </div>
      </BContainer>

      {/*
        모집 자료의 핵심 정보. 사진 위에 반투명하게 얹어 Hero 와 이어지게 한다.
        값은 A안 메인과 **같은 콘텐츠**에서 온다. 여기서 새로 적어 넣지 않는다.
      */}
      <div className="relative border-t border-white/20 bg-midnight/55 backdrop-blur-[2px]">
        <BContainer>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={
                  index % 2 === 1
                    ? "border-l border-white/15 px-5 py-6 sm:px-7"
                    : "px-5 py-6 sm:px-7 lg:border-l lg:border-white/15 lg:first:border-l-0"
                }
              >
                <dt className="flex items-center gap-2.5 text-[0.625rem] font-semibold tracking-[0.2em] text-white/70 uppercase">
                  {/* 아이콘 라이브러리를 새로 넣지 않는다. 얇은 선 하나로 항목을 표시한다. */}
                  <span aria-hidden="true" className="h-px w-4 bg-bronze-2" />
                  {fact.label}
                </dt>
                <dd className="mt-2.5 font-serif text-xl font-bold text-white sm:text-2xl">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </BContainer>
      </div>
    </section>
  );
}
