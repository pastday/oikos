import { Container } from "@/components/layout/Container";
import type { PageIntro } from "@/content/pages";

/** 상세 페이지 상단 공통 영역. 메인의 A안 색상 체계를 그대로 사용한다. */
export function PageHero({ intro }: { intro: PageIntro }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_80%_0%,rgba(163,125,61,0.24),transparent_65%)]"
      />

      <Container className="relative py-14 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.22em] text-gold-soft uppercase">
          {intro.eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold text-balance lg:text-4xl">
          {intro.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
          {intro.description}
        </p>
      </Container>
    </section>
  );
}
