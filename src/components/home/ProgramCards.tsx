import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import { buildProgramCardFacts } from "@/lib/cms/present";
import type { ProgramView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

/**
 * MBA / DBA 과정 카드.
 *
 * 화면 표기는 프로젝트 결정에 따라 MBA / DBA 를 사용한다.
 * 원본 문서에는 박사 학위명이 '경영학박사(Doctor of Management)' 로 기재되어 있어
 * DM / DBA 표기 불일치가 존재한다. 자세한 내용은 docs/decisions.md 참고.
 * 학위명과 학점·학기 수치는 DB(`Program`)에서 읽는다.
 * 비공개 과정은 카드에서 제외되며, 둘 다 비공개면 이 섹션 자체를 그리지 않는다.
 */
export function ProgramCards({
  content,
  programs: programViews,
}: {
  content: HomeContent;
  programs: ProgramView[];
}) {
  const { programs } = content;

  const cards = programs.items.flatMap((item) => {
    const view = programViews.find((program) => program.type === item.code);
    return view ? [{ item, view, facts: buildProgramCardFacts(view, programs.labels) }] : [];
  });

  if (cards.length === 0) return null;

  return (
    <section className="bg-surface py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={programs.eyebrow}
          title={programs.title}
          description={programs.description}
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map(({ item: program, view, facts }) => {
            const isDoctorate = program.code === "DBA";

            return (
              <article
                key={program.code}
                className={cn(
                  "flex flex-col rounded-xl border p-7 transition-shadow sm:p-9",
                  isDoctorate
                    ? "border-navy bg-navy text-white hover:shadow-lg"
                    : "border-line bg-background hover:shadow-md",
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "font-serif text-3xl font-bold tracking-wide",
                      isDoctorate ? "text-gold-soft" : "text-navy",
                    )}
                  >
                    {program.code}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isDoctorate ? "text-white/70" : "text-muted",
                    )}
                  >
                    {view.name}
                  </span>
                </div>

                <p
                  className={cn(
                    "mt-3 text-base",
                    isDoctorate ? "text-white/85" : "text-foreground/75",
                  )}
                >
                  {program.tagline}
                </p>

                <dl
                  className={cn(
                    "mt-7 grid grid-cols-2 gap-y-5 border-t pt-6 text-sm",
                    isDoctorate ? "border-white/15" : "border-line",
                  )}
                >
                  <div>
                    <dt
                      className={cn(
                        "text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {programs.labels.duration}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 font-semibold",
                        isDoctorate ? "text-white" : "text-navy",
                      )}
                    >
                      {facts.duration ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt
                      className={cn(
                        "text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {programs.labels.credits}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 font-semibold",
                        isDoctorate ? "text-white" : "text-navy",
                      )}
                    >
                      {facts.totalCredits ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dd
                      className={cn(
                        isDoctorate ? "text-white/75" : "text-foreground/70",
                      )}
                    >
                      {facts.breakdown}
                    </dd>
                    <dd
                      className={cn(
                        "mt-1 text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {facts.chapel}
                      {program.note ? ` · ${program.note}` : ""}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={program.href}
                  className={cn(
                    "mt-8 inline-flex w-fit items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors",
                    isDoctorate
                      ? "bg-white text-navy hover:bg-beige"
                      : "bg-navy text-white hover:bg-navy-soft",
                  )}
                >
                  {program.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
