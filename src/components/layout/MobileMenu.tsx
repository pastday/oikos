"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { isNavItemActive, type ResolvedNavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";

type MobileMenuProps = {
  locale: Locale;
  navItems: ResolvedNavItem[];
  ctaHref: string;
  ctaLabel: string;
  openLabel: string;
  closeLabel: string;
  menuLabel: string;
  languageLabel: string;
};

const PANEL_ID = "mobile-menu-panel";

export function MobileMenu({
  locale,
  navItems,
  ctaHref,
  ctaLabel,
  openLabel,
  closeLabel,
  menuLabel,
  languageLabel,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 열려 있는 동안에만 ESC 키 닫기와 배경 스크롤 잠금을 적용한다.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? closeLabel : openLabel}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-navy transition-colors hover:bg-navy-tint"
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200",
              isOpen ? "top-1.5 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute top-1.5 left-0 block h-0.5 w-5 bg-current transition-opacity duration-200",
              isOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200",
              isOpen ? "top-1.5 -rotate-45" : "top-3",
            )}
          />
        </span>
      </button>

      {isOpen && (
        <>
          {/* 외부 영역 클릭 시 닫기 */}
          <div
            className="fixed inset-0 top-16 z-40 bg-navy-dark/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            id={PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line bg-background shadow-lg"
          >
            <nav aria-label={menuLabel} className="px-5 py-4">
              <ul className="flex flex-col">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(pathname, item);

                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block border-b border-line py-3 text-base font-medium transition-colors",
                          isActive ? "text-navy" : "text-foreground hover:text-navy",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex items-center justify-between gap-4">
                <LanguageSwitcher
                  currentLocale={locale}
                  label={languageLabel}
                  className="text-sm"
                />

                <Link
                  href={ctaHref}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
                >
                  {ctaLabel}
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
