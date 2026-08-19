import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { buildProgramCardFacts } from "@/lib/cms/present";
import type { ProgramView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { BOffsetPair, BTextLink } from "./BBlocks";
import { bPath } from "./paths";

/**
 * MBA · DBA 두 과정.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 같은 크기의 판 두 개를 나란히 놓았다. A안의 카드 두 장과 구조가 같았다.
 * 지금은 **밝은 판 / 어두운 판의 대비 쌍**이고 오른쪽 판이 아래로 어긋나 있다.
 * 두 과정이 대등하게 늘어선 것이 아니라 읽는 순서가 생긴다.
 *
 * 수치는 라벨 옆 작은 글씨가 아니라 **큰 숫자**로 세운다.
 * 학기 수와 학점이 이 섹션에서 가장 먼저 읽혀야 하는 정보이기 때문이다.
 *
 * ## 수치의 출처
 *
 * 전부 `Program` 테이블이고 `buildProgramCardFacts` 로 문장을 만든다.
 * 여기서 숫자를 새로 적지 않는다. 값이 없으면 `—` 로 두어 원본에 없다는 사실을 남긴다.
 *
 * ## 링크
 *
 * 콘텐츠의 `href` 는 `/ko/programs/mba` 같은 A안 절대경로다. 그대로 쓰면 B안을
 * 벗어나므로 과정 코드로 B안 경로를 만든다.
 */
export function BProgramFeature({
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

  const [first, second] = panels;

  const render = (panel: (typeof panels)[number], dark: boolean) => (
    <article
      className={cn(
        "flex h-full flex-col",
        dark ? "bg-ink px-8 py-12 text-white lg:px-12 lg:py-14" : "text-ink",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("block h-px w-full", dark ? "bg-white/20" : "bg-ink/25")}
      />

      <p
        className={cn(
          "mt-8 font-serif text-6xl font-bold tracking-[0.04em] sm:text-7xl",
          dark ? "text-bronze-2" : "text-ink",
        )}
      >
        {panel.item.code}
      </p>

      <h3
        className={cn(
          "mt-6 font-serif text-xl font-bold",
          dark ? "text-white" : "text-ink",
        )}
      >
        {panel.view.name}
      </h3>

      <p
        className={cn(
          "mt-3 max-w-[46ch] text-base leading-relaxed",
          dark ? "text-white/70" : "text-ink/70",
        )}
      >
        {panel.item.tagline}
      </p>

      {/* 학기 · 학점을 큰 숫자로 세운다 */}
      <dl className="mt-10 flex items-stretch gap-8">
        <div>
          <dd
            className={cn(
              "font-serif text-5xl font-bold tabular-nums sm:text-6xl",
              dark ? "text-white" : "text-ink",
            )}
          >
            {panel.facts.duration ?? "—"}
          </dd>
          <dt
            className={cn(
              "mt-3 text-[0.625rem] font-semibold tracking-[0.2em] uppercase",
              dark ? "text-white/60" : "text-quiet",
            )}
          >
            {labels.duration}
          </dt>
        </div>

        <span
          aria-hidden="true"
          className={cn("w-px", dark ? "bg-white/20" : "bg-rule")}
        />

        <div>
          <dd
            className={cn(
              "font-serif text-5xl font-bold tabular-nums sm:text-6xl",
              dark ? "text-white" : "text-ink",
            )}
          >
            {panel.facts.totalCredits ?? "—"}
          </dd>
          <dt
            className={cn(
              "mt-3 text-[0.625rem] font-semibold tracking-[0.2em] uppercase",
              dark ? "text-white/60" : "text-quiet",
            )}
          >
            {labels.credits}
          </dt>
        </div>
      </dl>

      <div
        className={cn(
          "mt-8 space-y-1.5 text-sm",
          dark ? "text-white/65" : "text-ink/70",
        )}
      >
        {panel.facts.breakdown && <p>{panel.facts.breakdown}</p>}
        <p className={cn("text-xs", dark ? "text-white/60" : "text-quiet")}>
          {panel.facts.chapel}
          {panel.item.note ? ` · ${panel.item.note}` : ""}
        </p>
      </div>

      <div className="mt-auto pt-12">
        <BTextLink
          href={bPath(locale, `/programs/${panel.item.code.toLowerCase()}`)}
          tone={dark ? "dark" : "light"}
        >
          {panel.item.cta}
        </BTextLink>
      </div>
    </article>
  );

  if (!second) return render(first, false);

  return (
    <BOffsetPair
      first={render(first, false)}
      second={render(second, true)}
      offset="lg:mt-20"
    />
  );
}
