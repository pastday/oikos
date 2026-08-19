import Link from "next/link";
import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { buildProgramCardFacts } from "@/lib/cms/present";
import type { ProgramView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { bPath } from "./paths";

/**
 * MBA · DBA 두 과정 패널.
 *
 * 메인과 과정 허브(`/programs`)가 같은 것을 쓴다. 두 화면에서 과정 소개가
 * 조금씩 달라지지 않게 하려는 것이며, A안도 같은 데이터를 두 화면에서 쓴다.
 *
 * ## 수치는 전부 DB 에서 온다
 *
 * 학기 수·총학점·전공/공통 학점·채플 과목 수는 `Program` 테이블 값이고
 * `buildProgramCardFacts` 로 문장을 만든다. **B안에서 숫자를 새로 적지 않는다.**
 * (13단계 지시 15항) 값이 없으면 `—` 로 두어 원본에 없다는 사실을 그대로 보여준다.
 *
 * ## 링크
 *
 * 콘텐츠의 `href` 는 `/ko/programs/mba` 처럼 **A안 절대경로**다. 그대로 쓰면
 * B안을 보다가 A안으로 튀어나온다. 그래서 과정 코드로 B안 경로를 새로 만든다.
 */
export function ProgramPanelsB({
  locale,
  content,
  programs,
}: {
  locale: Locale;
  content: HomeContent;
  programs: ProgramView[];
}) {
  const labels = content.programs.labels;

  const panels = content.programs.items.flatMap((item) => {
    const view = programs.find((program) => program.type === item.code);
    return view
      ? [{ item, view, facts: buildProgramCardFacts(view, labels) }]
      : [];
  });

  if (panels.length === 0) return null;

  return (
    <div className="grid gap-px bg-rule lg:grid-cols-2">
      {panels.map(({ item, view, facts }) => {
        const isDoctorate = item.code === "DBA";

        return (
          <article
            key={item.code}
            className={cn(
              "flex flex-col px-8 py-12 lg:px-12 lg:py-16",
              isDoctorate ? "bg-ink text-white" : "bg-paper text-ink",
            )}
          >
            <div className="flex items-baseline gap-4">
              <span
                className={cn(
                  "font-serif text-5xl font-bold tracking-[0.06em] lg:text-6xl",
                  isDoctorate ? "text-bronze-2" : "text-ink",
                )}
              >
                {item.code}
              </span>
            </div>

            <h3
              className={cn(
                "mt-6 font-serif text-xl font-bold",
                isDoctorate ? "text-white" : "text-ink",
              )}
            >
              {view.name}
            </h3>

            <p
              className={cn(
                "mt-3 text-base leading-relaxed",
                isDoctorate ? "text-white/70" : "text-quiet",
              )}
            >
              {item.tagline}
            </p>

            <dl
              className={cn(
                "mt-10 grid grid-cols-2 gap-8 border-t pt-8",
                isDoctorate ? "border-white/15" : "border-rule",
              )}
            >
              <div>
                <dt
                  className={cn(
                    "text-[0.625rem] font-semibold tracking-[0.18em] uppercase",
                    isDoctorate ? "text-white/60" : "text-quiet",
                  )}
                >
                  {labels.duration}
                </dt>
                <dd
                  className={cn(
                    "mt-2 font-serif text-3xl font-bold",
                    isDoctorate ? "text-white" : "text-ink",
                  )}
                >
                  {facts.duration ?? "—"}
                </dd>
              </div>
              <div>
                <dt
                  className={cn(
                    "text-[0.625rem] font-semibold tracking-[0.18em] uppercase",
                    isDoctorate ? "text-white/60" : "text-quiet",
                  )}
                >
                  {labels.credits}
                </dt>
                <dd
                  className={cn(
                    "mt-2 font-serif text-3xl font-bold",
                    isDoctorate ? "text-white" : "text-ink",
                  )}
                >
                  {facts.totalCredits ?? "—"}
                </dd>
              </div>
            </dl>

            <div
              className={cn(
                "mt-6 space-y-1.5 text-sm",
                isDoctorate ? "text-white/65" : "text-ink/70",
              )}
            >
              {facts.breakdown && <p>{facts.breakdown}</p>}
              <p
                className={cn(
                  "text-xs",
                  isDoctorate ? "text-white/60" : "text-quiet",
                )}
              >
                {facts.chapel}
                {item.note ? ` · ${item.note}` : ""}
              </p>
            </div>

            <Link
              href={bPath(locale, `/programs/${item.code.toLowerCase()}`)}
              className={cn(
                "mt-auto inline-flex w-fit items-center gap-2 pt-12 text-xs font-semibold tracking-[0.14em] uppercase transition-colors",
                isDoctorate
                  ? "text-bronze-2 hover:text-white"
                  : "text-ink hover:text-bronze",
              )}
            >
              {item.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
