import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BRule } from "./BType";

/**
 * B안의 정보 배치 방식.
 *
 * ## 카드를 쓰지 않는다
 *
 * A안은 거의 모든 정보를 테두리 있는 상자에 담아 격자로 늘어놓는다.
 * B안은 **가로선으로 나눈 목록 · 화면을 가로지르는 띠 · 어긋난 두 판**을 쓴다.
 * 상자를 없애면 지면이 넓어 보이고, 크기가 다른 정보를 나란히 둘 수 있다.
 *
 * 여기 있는 것들이 B안 전 페이지의 배치 어휘 전부다.
 * 페이지마다 새 배치를 즉흥으로 만들지 않는다.
 */

// ---------------------------------------------------------------------------
// 번호가 붙은 가로선 목록
// ---------------------------------------------------------------------------

export type BRow = {
  id: string;
  /** 큰 글자로 세울 제목 */
  title: string;
  /** 제목 아래 보조 표기 (영문명 등) */
  subtitle?: string | null;
  /** 오른쪽 끝에 붙는 짧은 값 (학점 등) */
  meta?: string | null;
  /** 제목 아래 본문 */
  body?: string | null;
  href?: string;
};

/**
 * 번호 + 제목 + 설명이 가로선으로 나뉘어 이어지는 목록.
 *
 * 카드 격자를 대체하는 B안의 기본 배치다.
 * 항목 수가 4개든 20개든 같은 리듬으로 이어지고, 화면이 좁아져도 무너지지 않는다.
 */
export function BRowList({
  rows,
  tone = "light",
  size = "normal",
  startIndex = 1,
  numbered = true,
}: {
  rows: BRow[];
  tone?: "light" | "dark";
  /** `large` 는 제목을 섹션 제목 크기로 키운다. 항목이 적을 때 쓴다. */
  size?: "normal" | "large";
  startIndex?: number;
  numbered?: boolean;
}) {
  const dark = tone === "dark";
  if (rows.length === 0) return null;

  return (
    <ul className={cn("border-t", dark ? "border-white/15" : "border-rule")}>
      {rows.map((row, index) => {
        const content = (
          <>
            {numbered && (
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 pt-1 font-serif text-sm font-bold tabular-nums",
                  dark ? "text-bronze-2" : "text-bronze",
                )}
              >
                {String(startIndex + index).padStart(2, "0")}
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block font-serif font-bold",
                  size === "large"
                    ? "text-2xl sm:text-3xl"
                    : "text-xl sm:text-2xl",
                  dark ? "text-white" : "text-ink",
                )}
              >
                {row.title}
              </span>

              {row.subtitle && (
                <span
                  className={cn(
                    "mt-2 block text-sm tracking-wide",
                    dark ? "text-white/50" : "text-quiet",
                  )}
                >
                  {row.subtitle}
                </span>
              )}

              {row.body && (
                <span
                  className={cn(
                    "mt-4 block max-w-[62ch] text-[0.9375rem] leading-[1.85]",
                    dark ? "text-white/65" : "text-ink/70",
                  )}
                >
                  {row.body}
                </span>
              )}
            </span>

            {row.meta && (
              <span
                className={cn(
                  "shrink-0 pt-2 text-xs tracking-[0.12em] whitespace-nowrap uppercase",
                  dark ? "text-white/60" : "text-quiet",
                )}
              >
                {row.meta}
              </span>
            )}
          </>
        );

        return (
          <li
            key={row.id}
            className={cn("border-b", dark ? "border-white/15" : "border-rule")}
          >
            {row.href ? (
              <Link
                href={row.href}
                className={cn(
                  "flex gap-6 py-8 transition-colors sm:gap-10",
                  dark ? "hover:bg-white/5" : "hover:bg-paper-2",
                )}
              >
                {content}
              </Link>
            ) : (
              <div className="flex gap-6 py-8 sm:gap-10">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// 통계 띠
// ---------------------------------------------------------------------------

export type BStat = { label: string; value: string; note?: string | null };

/**
 * 수치를 가로로 늘어놓는 띠.
 *
 * 칸마다 상자를 두르지 않고 **세로선 하나로만** 나눈다.
 * 값은 크게, 라벨은 작은 대문자로 두어 수치가 먼저 읽히게 한다.
 */
export function BStatsBand({
  stats,
  tone = "dark",
  columns = 4,
}: {
  stats: BStat[];
  tone?: "light" | "dark";
  columns?: 2 | 3 | 4;
}) {
  const dark = tone === "dark";
  if (stats.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "px-5 py-8 sm:px-7 lg:py-10",
            // 왼쪽 세로선. 모바일은 2열, 데스크톱은 지정 열 수에 맞춰 첫 칸만 뺀다.
            dark ? "border-white/15" : "border-rule",
            index % 2 === 1 ? "border-l" : "",
            columns === 4 && "lg:border-l lg:first:border-l-0",
            columns === 3 && "lg:border-l lg:first:border-l-0",
          )}
        >
          <dt
            className={cn(
              "text-[0.625rem] font-semibold tracking-[0.2em] uppercase",
              dark ? "text-white/60" : "text-quiet",
            )}
          >
            {stat.label}
          </dt>
          <dd
            className={cn(
              "mt-3 font-serif text-2xl font-bold sm:text-3xl",
              dark ? "text-white" : "text-ink",
            )}
          >
            {stat.value}
          </dd>
          {stat.note && (
            <dd
              className={cn(
                "mt-2 text-xs leading-relaxed",
                dark ? "text-white/60" : "text-quiet",
              )}
            >
              {stat.note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// 어긋난 두 판
// ---------------------------------------------------------------------------

/**
 * 두 덩어리를 나란히 두되 **높이를 어긋나게** 놓는다.
 *
 * 같은 크기 카드 두 장을 나란히 놓으면 둘 중 무엇이 중요한지 알 수 없다.
 * 한쪽을 아래로 밀어 두면 읽는 순서가 생기고 지면에 리듬이 붙는다.
 */
export function BOffsetPair({
  first,
  second,
  /** 두 번째 판을 아래로 미는 정도 */
  offset = "lg:mt-24",
  className,
}: {
  first: ReactNode;
  second: ReactNode;
  offset?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-10 lg:grid-cols-2 lg:gap-14", className)}>
      <div>{first}</div>
      <div className={offset}>{second}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 버튼 · 링크
// ---------------------------------------------------------------------------

type ButtonTone = "solid" | "outline" | "bronze" | "onDark";

const buttonClass: Record<ButtonTone, string> = {
  solid: "bg-ink text-white hover:bg-ink-3",
  outline:
    "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-white",
  bronze: "bg-bronze text-white hover:bg-bronze-2 hover:text-ink",
  onDark:
    "border border-white/35 text-white hover:border-white hover:bg-white hover:text-ink",
};

export function BButton({
  href,
  children,
  tone = "solid",
  external = false,
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  external?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase transition-colors",
    buttonClass[tone],
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/** 밑줄 대신 화살표가 붙는 본문 링크. */
export function BTextLink({
  href,
  children,
  tone = "light",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors",
        tone === "dark"
          ? "text-bronze-2 hover:text-white"
          : "text-ink hover:text-bronze",
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

export { BRule };
