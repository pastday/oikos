import Image from "next/image";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import type { MediaView } from "@/lib/cms/types";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB } from "../SectionB";

/**
 * B안 메인 비주얼. B안에서 가장 중요한 화면이다.
 *
 * ## 지금은 사진이 없다
 *
 * `Media` 에 Hero 로 쓸 만한 이미지가 아직 하나도 없다. 그렇다고 인터넷에서
 * 임의의 사진을 내려받아 넣지 않는다. (13단계 지시 12·23항)
 *
 * 그래서 **겹친 gradient · 얇은 격자선 · 큰 타이포그래피**만으로 한 화면을 만든다.
 * 사진이 없어도 비어 보이지 않아야 하고, 사진이 들어오면 더 좋아져야 한다.
 *
 * ## 사진·영상이 생기면
 *
 * `backgroundMedia` 에 `MediaView` 를 넘기면 배경 사진이 깔리고
 * gradient 는 그 위의 overlay 로 바뀐다. 글자 대비는 그대로 유지된다.
 * 지금은 넘길 값이 없어 `null` 이며, 관리자가 CMS 에서 고를 수 있게 하는 것은
 * 별도 단계다. (schema 변경 없이 `PageSection` 으로 붙일 수 있게 형태를 맞춰 두었다)
 *
 * 영상 Hero 는 이번 단계에서 만들지 않는다. 업로드 정책이 이미지·PDF 로 한정되어 있고
 * 영상 지원은 MIME·용량·스트리밍·MediaPicker 까지 함께 손봐야 한다. (지시 13항)
 * 다만 이 구조는 영상이 들어와도 그대로 쓸 수 있다. 영상이 재생되지 않는 환경
 * (모바일 데이터 절약·`prefers-reduced-motion`·자동재생 차단)에서 보여 줄
 * **정지 화면이 곧 지금의 이 Hero** 이기 때문이다.
 */
export function HeroB({
  locale,
  content,
  backgroundMedia = null,
}: {
  locale: Locale;
  content: HomeContent;
  backgroundMedia?: MediaView | null;
}) {
  const { hero, facts } = content;

  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink text-white">
      {backgroundMedia && (
        <Image
          src={backgroundMedia.url}
          alt={backgroundMedia.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* 배경 구성 (사진이 있으면 overlay, 없으면 그 자체가 배경이 된다) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_75%_10%,rgba(168,130,63,0.28),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_5%_90%,rgba(28,51,85,0.7),transparent_65%)]"
      />
      {/* 얇은 격자. 건축 도면 같은 인상을 주어 사진 없이도 화면에 구조가 생긴다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:7rem_7rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.75)_0%,rgba(8,17,31,0.35)_45%,rgba(8,17,31,0.9)_100%)]"
      />

      <ContainerB className="relative pt-36 pb-14 lg:pt-44 lg:pb-16">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px w-12 bg-bronze-2/70" />
          <p className="text-[0.6875rem] font-semibold tracking-[0.28em] text-bronze-2 uppercase">
            {hero.eyebrow}
          </p>
        </div>

        <p className="mt-8 font-serif text-lg tracking-[0.06em] text-white/80 sm:text-xl">
          {hero.university}
        </p>

        <h1 className="mt-3 max-w-5xl font-serif text-[2.5rem] leading-[1.05] font-bold text-balance sm:text-6xl lg:text-[4.5rem]">
          {hero.title}
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
          {hero.major}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <span className="font-serif text-3xl font-bold tracking-[0.18em] sm:text-4xl">
            {hero.degrees}
          </span>
          <span className="border border-bronze-2/50 px-5 py-2 text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
            {hero.online}
          </span>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonB href={bPath(locale, "/programs")} variant="onDark">
            {hero.ctaPrograms}
          </ButtonB>
          <ButtonB href={bPath(locale, "/consultation")} variant="onDarkGhost">
            {hero.ctaConsultation}
          </ButtonB>
        </div>
      </ContainerB>

      {/*
        모집 자료의 핵심 정보. 값은 A안 메인과 **같은 콘텐츠**에서 온다.
        (학기 수·개강 시점 등을 여기서 새로 적어 넣지 않는다 — 지시 6항)
      */}
      <div className="relative border-t border-white/15">
        <ContainerB>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={
                  index % 2 === 1
                    ? "border-l border-white/15 px-5 py-7 sm:px-7"
                    : "px-5 py-7 sm:px-7 lg:border-l lg:border-white/15 lg:first:border-l-0"
                }
              >
                <dt className="text-[0.625rem] font-semibold tracking-[0.18em] text-white/60 uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-2.5 font-serif text-lg font-bold text-white sm:text-xl">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </ContainerB>
      </div>
    </section>
  );
}
