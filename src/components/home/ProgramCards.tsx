import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { HomeContent } from "@/content/home";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

/**
 * MBA / DBA 과정 카드.
 *
 * 화면 표기는 프로젝트 결정에 따라 MBA / DBA 를 사용한다.
 * 원본 문서에는 박사 학위명이 '경영학박사(Doctor of Management)' 로 기재되어 있어
 * DM / DBA 표기 불일치가 존재한다. 자세한 내용은 docs/decisions.md 참고.
 * 학점·학기 수치는 원본 문서 값을 그대로 사용하며 임의로 조정하지 않는다.
 */
export function ProgramCards({ content }: { content: HomeContent }) {
  const { programs } = content;

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
          {programs.items.map((program) => {
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
                    {program.degreeName}
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
                      {program.duration}
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
                      {program.totalCredits}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dd
                      className={cn(
                        isDoctorate ? "text-white/75" : "text-foreground/70",
                      )}
                    >
                      {program.creditBreakdown}
                    </dd>
                    <dd
                      className={cn(
                        "mt-1 text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {program.chapel}
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
