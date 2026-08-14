import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";

/**
 * 100% 온라인 과정 안내.
 * 원본 자료에 명시된 내용(온라인 과정, 학기 일정)만 사용하고 광고성 표현을 덧붙이지 않는다.
 */
export function OnlineSection({ content }: { content: HomeContent }) {
  const { online } = content;

  return (
    <section className="relative overflow-hidden bg-navy-dark py-16 text-white lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_50%,rgba(163,125,61,0.22),transparent_65%)]"
      />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="inline-block rounded-full border border-gold-soft/50 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-gold-soft">
              {online.badge}
            </p>
            <h2 className="mt-6 font-serif text-2xl font-bold text-balance sm:text-3xl">
              {online.title}
            </h2>
            <p className="mt-4 leading-relaxed text-white/75">
              {online.description}
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/5 p-7">
            <h3 className="text-sm font-semibold tracking-wide text-gold-soft">
              {online.scheduleTitle}
            </h3>
            <ul className="mt-5 space-y-3">
              {online.schedule.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-white/85 last:border-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
