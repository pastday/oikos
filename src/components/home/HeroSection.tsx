import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";

/**
 * 메인 비주얼.
 *
 * 홈피구성안의 첫 화면 구성(로고 / 대학원명 / 전공 / MBA·DBA / 100% 온라인 / 입학상담 버튼)을 따른다.
 * 제공된 모집 이미지의 캠퍼스 사진은 출처가 불분명해 사용하지 않고,
 * 네이비 기반 gradient 로 배경을 구성한다. (지시 6항)
 */
export function HeroSection({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { hero, facts } = content;

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_75%_0%,rgba(163,125,61,0.30),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_100%,rgba(29,61,104,0.55),transparent_60%)]"
      />

      <Container className="relative">
        <div className="py-16 sm:py-20 lg:py-28">
          <div className="flex items-center gap-4">
            <Image
              src="/images/oikos-seal.png"
              alt={hero.logoAlt}
              width={295}
              height={220}
              priority
              className="h-14 w-auto shrink-0 sm:h-16"
            />
            <p className="font-serif text-xs font-semibold tracking-[0.25em] text-gold-soft sm:text-sm">
              {hero.eyebrow}
            </p>
          </div>

          <h1 className="mt-8 max-w-3xl font-serif text-3xl leading-[1.2] font-bold text-balance sm:text-4xl lg:text-[3.25rem]">
            {hero.university}
            <br />
            {hero.title}
          </h1>

          <p className="mt-5 text-lg text-white/85 sm:text-xl">{hero.major}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="border-t-2 border-gold pt-3 font-serif text-2xl font-bold tracking-[0.15em] sm:text-3xl">
              {hero.degrees}
            </span>
            <span className="rounded-full border border-gold-soft/50 bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold-soft">
              {hero.online}
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={localePath(locale, "/programs")}
              className="inline-flex justify-center rounded-md bg-white px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-beige"
            >
              {hero.ctaPrograms}
            </Link>
            <Link
              href={localePath(locale, "/consultation")}
              className="inline-flex justify-center rounded-md border border-white/45 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              {hero.ctaConsultation}
            </Link>
          </div>
        </div>

        {/* 모집 자료의 핵심 정보 4가지 */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-t-lg border-t border-white/15 bg-white/15 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-navy px-5 py-6 sm:px-6">
              <dt className="text-xs font-medium tracking-wide text-white/60">
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-lg font-bold text-white sm:text-xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
