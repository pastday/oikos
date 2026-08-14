"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  content: ReactNode;
};

/**
 * 교과목·FAQ 처럼 항목이 많은 내용을 접어서 보여준다.
 * 한 번에 하나만 열리며, 버튼에 aria-expanded / aria-controls 를 둔다.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-background">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <li key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface sm:px-6"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-semibold text-navy">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      {item.subtitle}
                    </span>
                  )}
                </span>

                {item.meta && (
                  <span className="mt-0.5 shrink-0 text-xs whitespace-nowrap text-muted">
                    {item.meta}
                  </span>
                )}

                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 shrink-0 text-navy transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 7.5 10 12.5 15 7.5" />
                  </svg>
                </span>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-line bg-surface px-5 py-5 text-sm leading-relaxed text-foreground/80 sm:px-6"
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
