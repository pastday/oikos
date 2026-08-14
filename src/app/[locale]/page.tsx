import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "",
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  });
}

/**
 * 메인 페이지.
 * 3단계에서는 Hero 골격까지만 만든다.
 * 대학원 소개·전공 소개·교수진 등 Hero 아래 섹션은 4단계에서 원본 자료를 근거로 제작한다.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* 실제 이미지는 아직 사용하지 않는다. 자료 제공 전까지 gradient 로 대체한다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(163,125,61,0.28),transparent_60%)]"
      />

      <Container className="relative py-20 lg:py-28">
        <p className="font-serif text-sm font-semibold tracking-[0.3em] text-gold-soft">
          {dict.home.eyebrow}
        </p>

        <h1 className="mt-6 max-w-3xl text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
          {dict.home.title}
        </h1>

        <p className="mt-4 text-lg text-white/85 sm:text-xl">
          {dict.home.subtitle}
        </p>

        <p className="mt-6 inline-block border-t-2 border-gold pt-3 font-serif text-2xl font-bold tracking-[0.15em] sm:text-3xl">
          {dict.home.degrees}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={localePath(locale, "/programs")}
            className="inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-beige"
          >
            {dict.home.ctaPrograms}
          </Link>

          <Link
            href={localePath(locale, "/consultation")}
            className="inline-flex justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            {dict.home.ctaConsultation}
          </Link>
        </div>
      </Container>
    </section>
  );
}
