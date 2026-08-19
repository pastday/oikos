"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItemB = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  content: ReactNode;
};

/**
 * B안 아코디언. 교과목 목록과 FAQ 가 함께 쓴다.
 *
 * A안은 테두리로 둘러싼 카드 안에 항목을 넣지만, B안은 **가로선만 그은 목록**이다.
 * 지면이 넓고 여백이 많은 B안에서는 선 하나만으로 충분히 구분되고,
 * 학술 자료집 같은 인상이 난다.
 *
 * 접근성 처리는 A안과 동일하다. 버튼에 `aria-expanded` / `aria-controls` 를 두고
 * 열린 영역에 `role="region"` 과 라벨을 붙인다. 한 번에 하나만 열린다.
 */
export function AccordionB({
  items,
  numbered = false,
}: {
  items: AccordionItemB[];
  /** 번호를 붙일지. 교과목처럼 순서가 의미 있는 목록에서 쓴다. */
  numbered?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  return (
    <ul className="border-t border-rule">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <li key={item.id} className="border-b border-rule">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-start gap-5 py-6 text-left transition-colors hover:bg-paper-2"
              >
                {numbered && (
                  <span
                    aria-hidden="true"
                    className="mt-1 w-8 shrink-0 font-serif text-sm font-bold text-bronze"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg leading-snug font-bold text-ink">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="mt-1.5 block text-sm leading-relaxed text-quiet">
                      {item.subtitle}
                    </span>
                  )}
                </span>

                {item.meta && (
                  <span className="mt-1.5 shrink-0 text-xs tracking-wide whitespace-nowrap text-quiet">
                    {item.meta}
                  </span>
                )}

                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 shrink-0 text-bronze transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                >
                  {/* 십자 → 45도 회전하면 닫기(×)가 된다. 선만으로 구성해 B안 톤에 맞춘다. */}
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                  >
                    <path d="M10 3v14M3 10h14" />
                  </svg>
                </span>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "pb-8 text-[0.9375rem] leading-[1.9] text-ink/75",
                  numbered ? "pl-13" : "",
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
