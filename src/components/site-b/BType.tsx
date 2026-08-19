import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * B안의 글자.
 *
 * A안은 제목이 `text-2xl`~`text-4xl` 로 고정이고 본문과의 크기 차이가 크지 않다.
 * B안은 제목을 **화면 폭에 따라 늘어나는 clamp 스케일**(globals.css 의 `--text-*`)로 두고
 * 행간을 1 아래로 조인다. 본문과의 대비가 훨씬 커진다.
 *
 * 서체 자체는 A안과 같은 것(Georgia / 시스템 sans)을 쓴다.
 * 외부 웹폰트를 새로 받아 오면 빌드가 네트워크에 의존하게 되고 라이선스도 따져야 한다.
 * **크기·행간·자간·대소문자만으로** 충분히 다른 인상을 만들 수 있다.
 */

/** 작은 대문자 라벨. 섹션 위·아래 어디서나 같은 규칙으로 쓴다. */
export function BEyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[0.6875rem] font-semibold tracking-[0.26em] uppercase",
        tone === "dark" ? "text-bronze-2" : "text-bronze",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * 가장 큰 글자. 한 낱말 또는 아주 짧은 구절에만 쓴다.
 *
 * ## 낱말을 절대 쪼개지 않는다
 *
 * 전에 `break-words` 를 붙여 두었더니 `ONLINE` 이 `ONLIN` / `E` 로 찢어졌다.
 * 그 속성은 **낱말 한가운데서도 줄을 바꾸라**는 뜻이라, 글자가 칸보다 크면
 * 반드시 그런 결과가 나온다. 지금은 붙이지 않는다. (CSS 기본값은 낱말을 지키는 쪽이다)
 *
 * 대신 크기를 칸에 맞춘다. `text-mega` 는 `cqi` 단위라
 * **부모에 `@container` 가 붙어 있어야** 그 칸 폭을 기준으로 계산된다.
 * 붙이지 않으면 화면 폭 기준으로 떨어져 다시 칸을 넘칠 수 있다.
 *
 * `nowrap` 은 `ONLINE` 처럼 **한 낱말짜리**에만 켠다.
 * 여러 낱말(예: "2026년 10월")에 켜면 줄을 바꿀 곳이 없어져 칸을 넘친다.
 */
export function BMega({
  children,
  tone = "dark",
  nowrap = false,
  dim = false,
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  nowrap?: boolean;
  /**
   * 두 줄짜리 선언에서 **둘째 줄을 한 단계 눌러** 첫 줄이 먼저 읽히게 한다.
   *
   * `className` 으로 색을 덮어쓰지 않는 이유: 이 프로젝트의 `cn` 은 tailwind-merge 가
   * 아니라 단순 연결이라 `text-white` 와 `text-white/35` 가 함께 남고
   * 어느 쪽이 이길지 CSS 순서에 맡겨진다. 그래서 선택지를 여기서 정한다.
   */
  dim?: boolean;
  className?: string;
}) {
  const color = dim
    ? tone === "dark"
      ? "text-white/35"
      : "text-ink/25"
    : tone === "dark"
      ? "text-white"
      : "text-ink";

  return (
    <span
      className={cn(
        "block font-serif text-mega font-bold",
        nowrap && "whitespace-nowrap",
        color,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Hero 와 페이지 제목. `as` 로 h1/h2 를 고른다. */
export function BDisplay({
  as: Tag = "h2",
  children,
  tone = "light",
  className,
}: {
  as?: "h1" | "h2" | "p";
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-serif text-display font-bold text-balance",
        tone === "dark" ? "text-white" : "text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** 섹션 제목. 비어 있으면 그리지 않는다. (CMS 에서 비워 둘 수 있다) */
export function BHeadline({
  as: Tag = "h2",
  children,
  tone = "light",
  size = "normal",
  className,
}: {
  as?: "h2" | "h3";
  children: ReactNode;
  tone?: "light" | "dark";
  /**
   * `small` 은 도입 문장을 더 크게 세우는 자리에서 제목을 한 단계 낮출 때 쓴다.
   *
   * 이 프로젝트의 `cn` 은 tailwind-merge 가 아니라 단순 연결이라
   * `className` 으로 글자 크기를 덮어쓸 수 없다. 그래서 선택지를 여기서 정한다.
   */
  size?: "normal" | "small";
  className?: string;
}) {
  if (!children) return null;

  return (
    <Tag
      className={cn(
        "font-serif font-bold text-balance",
        size === "small" ? "text-xl sm:text-2xl" : "text-headline",
        tone === "dark" ? "text-white" : "text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** 도입 문장. 본문보다 크고 제목보다 작다. */
export function BLead({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-lg leading-[1.75] text-pretty sm:text-xl",
        tone === "dark" ? "text-white/75" : "text-ink/75",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** 본문 문단 묶음. */
export function BBody({
  paragraphs,
  tone = "light",
  columns = 1,
  className,
}: {
  paragraphs: string[];
  tone?: "light" | "dark";
  /** 2 를 주면 넓은 화면에서 두 단으로 흐른다. 잡지 지면처럼 보인다. */
  columns?: 1 | 2;
  className?: string;
}) {
  if (paragraphs.length === 0) return null;

  return (
    <div
      className={cn(
        "space-y-5",
        columns === 2 && "lg:columns-2 lg:gap-12 lg:space-y-0",
        className,
      )}
    >
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 24)}
          className={cn(
            "max-w-[62ch] text-[1.0625rem] leading-[1.85]",
            columns === 2 && "lg:mb-5 lg:max-w-none lg:break-inside-avoid",
            tone === "dark" ? "text-white/70" : "text-ink/75",
          )}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/**
 * 인용처럼 크게 세우는 문장.
 * 상자에 넣지 않는다. 위아래 여백과 크기만으로 본문과 구분한다.
 */
export function BPullQuote({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-4xl font-serif text-2xl leading-[1.45] text-balance sm:text-3xl",
        tone === "dark" ? "text-white/90" : "text-ink/90",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** 얇은 가로선. B안은 상자 대신 이 선으로 정보를 나눈다. */
export function BRule({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px w-full",
        tone === "dark" ? "bg-white/15" : "bg-rule",
        className,
      )}
    />
  );
}

/**
 * 아직 확정되지 않은 정보를 알리는 자리.
 * 카드로 감싸지 않고 왼쪽 선 하나로 표시한다.
 */
export function BNotice({
  title,
  tone = "light",
  children,
}: {
  title?: string;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl border-l-2 py-1 pl-6",
        tone === "dark" ? "border-white/25" : "border-rule-2",
      )}
    >
      {title && (
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "dark" ? "text-white" : "text-ink",
          )}
        >
          {title}
        </p>
      )}
      <div
        className={cn(
          "mt-2 text-sm leading-relaxed",
          tone === "dark" ? "text-white/60" : "text-quiet",
        )}
      >
        {children}
      </div>
    </div>
  );
}
