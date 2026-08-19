"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BAccordionItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  content: ReactNode;
};

/**
 * 펼쳐 보는 목록. 교과목과 FAQ 가 함께 쓴다.
 *
 * A안은 테두리로 둘러싼 카드 안에 작은 글씨(15px) 항목을 촘촘히 넣는다.
 * B안은 **테두리 없는 전폭 목록**이고 제목이 세리프 큰 글자다.
 * 번호가 왼쪽 여백에 서고, 펼친 내용은 그 번호 폭만큼 들여쓰기되어
 * 본문 다른 곳의 레일·목록과 같은 축을 공유한다.
 *
 * 접근성 처리는 A안과 같다. `aria-expanded` / `aria-controls` / `role="region"`.
 * 한 번에 하나만 열린다.
 */
export function BAccordion({
  items,
  numbered = false,
  tone = "light",
}: {
  items: BAccordionItem[];
  numbered?: boolean;
  tone?: "light" | "dark";
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();
  const dark = tone === "dark";

  if (items.length === 0) return null;

  return (
    <ul className={cn("border-t", dark ? "border-white/15" : "border-rule")}>
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <li
            key={item.id}
            className={cn("border-b", dark ? "border-white/15" : "border-rule")}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={cn(
                  "flex w-full items-start gap-5 py-7 text-left transition-colors sm:gap-8",
                  dark ? "hover:bg-white/5" : "hover:bg-paper-2",
                )}
              >
                {numbered && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-8 shrink-0 pt-2 font-serif text-sm font-bold tabular-nums",
                      dark ? "text-bronze-2" : "text-bronze",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-serif text-xl leading-snug font-bold text-balance sm:text-2xl",
                      dark ? "text-white" : "text-ink",
                    )}
                  >
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span
                      className={cn(
                        "mt-2 block text-sm tracking-wide",
                        dark ? "text-white/50" : "text-quiet",
                      )}
                    >
                      {item.subtitle}
                    </span>
                  )}
                </span>

                {item.meta && (
                  <span
                    className={cn(
                      "shrink-0 pt-3 text-xs tracking-[0.12em] whitespace-nowrap uppercase",
                      dark ? "text-white/60" : "text-quiet",
                    )}
                  >
                    {item.meta}
                  </span>
                )}

                {/* 십자 → 45도 돌리면 닫기 표시가 된다. 선 두 개로만 만든다. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative mt-3 block h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-45",
                    dark ? "text-bronze-2" : "text-bronze",
                  )}
                >
                  <span className="absolute top-1/2 left-0 h-px w-full bg-current" />
                  <span className="absolute top-0 left-1/2 h-full w-px bg-current" />
                </span>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "pb-9 text-[0.9375rem] leading-[1.9]",
                  numbered && "sm:pl-16",
                  dark ? "text-white/70" : "text-ink/75",
                )}
              >
                {item.content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
