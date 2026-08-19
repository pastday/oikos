import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ContainerB } from "./ContainerB";

/**
 * B안의 공통 조판 요소.
 *
 * 페이지마다 CSS 를 즉흥적으로 만들지 않기 위해 **여백·제목 크기·선 두께를 여기서 한 번만**
 * 정하고 모든 B안 페이지가 이것만 쓴다. (13단계 지시 7·13항)
 *
 * A안과 눈에 띄게 다른 점
 *  - 모서리를 둥글게 하지 않는다. A안은 `rounded-lg` 카드가 기본이다.
 *  - 여백이 훨씬 넓다. (A안 py-16/24 → B안 py-24/32)
 *  - 제목이 크고 얇은 선과 번호가 함께 붙는 editorial 조판을 쓴다.
 */

type Tone = "paper" | "paper-2" | "ink";

const toneClass: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  "paper-2": "bg-paper-2 text-ink",
  ink: "bg-ink text-white",
};

export function SectionB({
  tone = "paper",
  size = "normal",
  className,
  children,
}: {
  tone?: Tone;
  /**
   * 세로 여백. `compact` 는 안내 상자 하나만 있는 짧은 섹션에 쓴다.
   *
   * 이 프로젝트의 `cn` 은 tailwind-merge 가 아니라 단순 연결이라
   * `className` 으로 여백을 덮어쓸 수 없다. 그래서 선택지를 여기서 정한다.
   */
  size?: "normal" | "compact";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        size === "compact" ? "py-12 lg:py-16" : "py-20 lg:py-32",
        toneClass[tone],
        className,
      )}
    >
      <ContainerB>{children}</ContainerB>
    </section>
  );
}

/**
 * 섹션 제목.
 *
 * `index` 를 주면 `01` 처럼 번호가 붙는다. 메인처럼 섹션이 길게 이어지는 페이지에서
 * 지금 어디쯤인지 알려 주고, 전체를 하나의 편집물처럼 묶어 준다.
 */
export function SectionHeadB({
  index,
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
}: {
  index?: number;
  eyebrow?: string;
  /** 비어 있으면 제목을 그리지 않는다. CMS 에서 비워 둘 수 있기 때문이다. */
  title: string;
  description?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const isDark = tone === "dark";

  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {(eyebrow || index !== undefined) && (
        <div
          className={cn(
            "flex items-center gap-4",
            align === "center" && "justify-center",
          )}
        >
          {index !== undefined && (
            <span
              className={cn(
                "font-serif text-sm font-bold tracking-[0.1em]",
                isDark ? "text-bronze-2" : "text-bronze",
              )}
            >
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span
            aria-hidden="true"
            className={cn(
              "h-px w-10",
              isDark ? "bg-bronze-2/60" : "bg-bronze/50",
            )}
          />
          {eyebrow && (
            <span
              className={cn(
                "text-[0.6875rem] font-semibold tracking-[0.22em] uppercase",
                isDark ? "text-bronze-2" : "text-bronze",
              )}
            >
              {eyebrow}
            </span>
          )}
        </div>
      )}

      {/* 관리자가 제목을 비워 두면 빈 h2 를 그리지 않는다.
          "값이 없으면 그 부분을 그리지 않는다" 는 A안의 규칙을 그대로 따른다. */}
      {title && (
        <h2
          className={cn(
            "mt-6 font-serif text-3xl leading-[1.15] font-bold text-balance sm:text-4xl lg:text-[2.75rem]",
            isDark ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={cn(
            "mt-6 text-base leading-[1.9]",
            isDark ? "text-white/70" : "text-quiet",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** 본문 문단. 줄 길이를 제한해 읽기 쉽게 둔다. */
export function ProseB({
  paragraphs,
  tone = "light",
  className,
}: {
  paragraphs: string[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl space-y-6", className)}>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 24)}
          className={cn(
            "text-[1.0625rem] leading-[1.95]",
            tone === "dark" ? "text-white/75" : "text-ink/80",
          )}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/**
 * 라벨 + 값. 값을 크게 두어 수치가 먼저 읽히게 한다.
 * 값은 전부 DB/CMS 에서 온 것이며 여기서 새로 만들지 않는다.
 */
export function FactGridB({
  items,
  columns = 4,
  tone = "light",
}: {
  items: { label: string; value: string; note?: string }[];
  columns?: 2 | 3 | 4;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <dl
      className={cn(
        "grid gap-px sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        isDark ? "bg-white/15" : "bg-rule",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("px-6 py-8", isDark ? "bg-ink" : "bg-paper")}
        >
          <dt
            className={cn(
              "text-[0.6875rem] font-semibold tracking-[0.16em] uppercase",
              isDark ? "text-white/50" : "text-quiet",
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              "mt-3 font-serif text-xl font-bold",
              isDark ? "text-white" : "text-ink",
            )}
          >
            {item.value}
          </dd>
          {item.note && (
            <dd
              className={cn(
                "mt-2 text-xs leading-relaxed",
                isDark ? "text-white/50" : "text-quiet",
              )}
            >
              {item.note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** 강조 문장. 왼쪽 굵은 선으로 본문과 구분한다. */
export function PullQuoteB({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={cn(
        "max-w-3xl border-l-2 py-2 pl-6 font-serif text-lg leading-[1.7]",
        tone === "dark"
          ? "border-bronze-2 text-white/85"
          : "border-bronze text-ink/85",
      )}
    >
      {children}
    </p>
  );
}

/**
 * 아직 확정되지 않은 정보를 알리는 상자.
 * 없는 사실을 지어내지 않기 위한 장치이며 A안과 같은 목적으로 쓴다.
 */
export function NoticeB({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl border border-dashed border-rule-2 bg-paper-2 px-6 py-5">
      {title && <p className="text-sm font-semibold text-ink">{title}</p>}
      <div className="mt-2 text-sm leading-relaxed text-quiet">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------

type ButtonVariant = "solid" | "outline" | "onDark" | "onDarkGhost";

const buttonClass: Record<ButtonVariant, string> = {
  solid: "bg-ink text-white hover:bg-ink-3",
  outline: "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-white",
  onDark: "bg-bronze text-white hover:bg-bronze-2 hover:text-ink",
  onDarkGhost:
    "border border-white/35 text-white hover:border-white hover:bg-white hover:text-ink",
};

/** B안 버튼. 각진 모서리와 넓은 자간을 공통으로 쓴다. */
export function ButtonB({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center px-7 py-4 text-xs font-semibold tracking-[0.14em] uppercase transition-colors",
        buttonClass[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
