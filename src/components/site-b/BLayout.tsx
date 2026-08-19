import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * B안의 지면 규칙.
 *
 * ## A안과 구조적으로 무엇이 다른가
 *
 * A안은 모든 섹션이 하나의 중앙 정렬 컨테이너(76rem) 안에서 시작하고 끝난다.
 * B안은 **왼쪽에 세로 레일(rail)이 상시 존재**하고 본문이 그 오른쪽에서 시작한다.
 * 레일에는 섹션 번호와 세로로 세운 라벨이 들어간다.
 *
 * 이 레일 하나가 B안 전 페이지를 관통하는 구조적 서명이다.
 * 색을 모두 지워도 두 사이트가 다르게 보이는 이유가 여기에 있다.
 * (A안에는 이런 축이 아예 없다)
 *
 * 레일은 데스크톱에서만 세로로 서고, 좁은 화면에서는 가로 머리글로 접힌다.
 */

/** 지면 폭. A안(76rem)보다 넓다. */
export function BContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-site-b px-6 sm:px-10 lg:px-14",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Tone = "paper" | "stone" | "ink" | "midnight";

const toneClass: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  stone: "bg-stone text-ink",
  ink: "bg-ink text-white",
  midnight: "bg-midnight text-white",
};

/** 레일과 본문의 색은 면에 따라 달라진다. */
export function isDarkTone(tone: Tone): boolean {
  return tone === "ink" || tone === "midnight";
}

/**
 * 레일이 붙은 섹션.
 *
 * `index` 와 `label` 을 주면 왼쪽에 번호와 세로 라벨이 선다.
 * 레일은 스크롤하는 동안 제자리에 머물러(`sticky`) 지금 읽는 곳이 어디인지 알려 준다.
 */
export function BSection({
  index,
  label,
  tone = "paper",
  bleed = false,
  id,
  className,
  children,
}: {
  index?: number;
  label?: string;
  tone?: Tone;
  /** 본문을 컨테이너 밖까지 흘릴 때. 레일은 그대로 두고 본문만 넓게 쓴다. */
  bleed?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const dark = isDarkTone(tone);
  const hasRail = index !== undefined || Boolean(label);

  return (
    <section
      id={id}
      className={cn("py-20 lg:py-32", toneClass[tone], className)}
    >
      <BContainer>
        <div
          className={cn(
            "grid gap-y-10",
            hasRail && "lg:grid-cols-[5.5rem_1fr] lg:gap-x-12 xl:gap-x-16",
          )}
        >
          {hasRail && <BRail index={index} label={label} dark={dark} />}
          <div className={cn(bleed && "lg:-mr-14")}>{children}</div>
        </div>
      </BContainer>
    </section>
  );
}

/**
 * 세로 레일.
 *
 * 데스크톱: 번호 아래로 얇은 선이 흐르고 라벨이 세로로 선다.
 * 모바일: 번호와 라벨이 가로로 눕고 그 아래 선이 그어진다.
 */
export function BRail({
  index,
  label,
  dark = false,
}: {
  index?: number;
  label?: string;
  dark?: boolean;
}) {
  const numberColor = dark ? "text-bronze-2" : "text-bronze";
  const lineColor = dark ? "bg-white/20" : "bg-rule-2";
  const labelColor = dark ? "text-white/50" : "text-quiet";

  return (
    <div className="lg:relative">
      <div className="flex items-center gap-4 lg:sticky lg:top-32 lg:block">
        {index !== undefined && (
          <span
            className={cn(
              "font-serif text-index font-bold tabular-nums",
              numberColor,
            )}
          >
            {String(index).padStart(2, "0")}
          </span>
        )}

        <span
          aria-hidden="true"
          className={cn("h-px flex-1 lg:my-5 lg:h-24 lg:w-px", lineColor)}
        />

        {label && (
          <span
            className={cn(
              "text-[0.625rem] font-semibold tracking-[0.24em] whitespace-nowrap uppercase lg:[writing-mode:vertical-rl]",
              labelColor,
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 화면 폭을 통째로 쓰는 띠.
 *
 * 컨테이너 안에서 좌우로 빠져나가야 하므로 섹션 바깥에 직접 놓는다.
 * Statement · Hero 아래 통계 띠처럼 **면 자체가 메시지인 곳**에 쓴다.
 */
export function BBand({
  tone = "ink",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn(toneClass[tone], className)}>{children}</section>
  );
}
