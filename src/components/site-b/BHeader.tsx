"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { replaceLocaleInPath } from "@/lib/navigation";
import { isBNavActive, type BNavItem } from "./paths";

/**
 * B안 Header.
 *
 * ## A안과 무엇이 다른가
 *
 * A안은 **2행 구조**다. 1행에 로고·언어·CTA, 2행에 메뉴가 있고 항상 흰 바탕으로 고정된다.
 * B안은 **1행**이고 Hero 위에 겹쳐 놓는다. 그리고 스크롤하면 색만 바뀌는 것이 아니라
 * **높이가 줄어든다.** (6rem → 4rem) 지면을 읽기 시작하면 머리글이 물러나는 방식이다.
 *
 * 모바일 메뉴도 A안(위에서 내려오는 패널)과 다르다.
 * 화면 전체를 덮는 어두운 면에 **번호가 붙은 큰 세리프 항목**을 세운다.
 * 본문의 레일·목록과 같은 어휘라 메뉴를 열어도 같은 사이트로 읽힌다.
 */

const PANEL_ID = "design-b-menu";

/** 이 높이를 넘어가면 머리글을 접는다. */
const COMPACT_AFTER_PX = 32;

export function BHeader({
  locale,
  navItems,
  ctaHref,
  labels,
  wordmark,
  wordmarkSub,
}: {
  locale: Locale;
  navItems: BNavItem[];
  ctaHref: string;
  labels: {
    cta: string;
    logoAlt: string;
    primaryNav: string;
    openMenu: string;
    closeMenu: string;
    mobileMenu: string;
    language: string;
  };
  wordmark: string;
  wordmarkSub: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCompact, setIsCompact] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsCompact(window.scrollY > COMPACT_AFTER_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메뉴가 열려 있는 동안에만 ESC 닫기와 배경 스크롤 잠금을 건다.
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

  // 메뉴가 열려 있으면 그 자체가 어두운 면이므로 머리글도 밝은 글자를 쓴다.
  const onDark = !isCompact || isOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        isOpen
          ? "bg-transparent"
          : isCompact
            ? "border-b border-rule bg-paper/95 backdrop-blur-sm"
            : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-site-b items-center justify-between gap-6 px-6 transition-[height] duration-300 sm:px-10 lg:px-14",
          isCompact && !isOpen ? "h-16" : "h-24",
        )}
      >
        <Link
          href={navItems[0]?.href ?? "/"}
          className="flex shrink-0 items-center gap-3.5"
        >
          {/* 어두운 Hero 위에서도 문장이 보이도록 흰 판에 얹는다.
              로고 자체는 비율 그대로 쓰고 다시 디자인하지 않는다. */}
          <span
            className={cn(
              "flex items-center justify-center bg-white transition-all duration-300",
              isCompact && !isOpen ? "h-9 w-9" : "h-12 w-12",
            )}
          >
            <Image
              src="/images/oikos-seal.png"
              alt={labels.logoAlt}
              width={295}
              height={220}
              priority
              className={cn(
                "w-auto transition-all duration-300",
                isCompact && !isOpen ? "h-6" : "h-8",
              )}
            />
          </span>

          <span className="flex flex-col justify-center leading-none">
            <span
              className={cn(
                "font-serif font-bold transition-colors",
                isCompact && !isOpen
                  ? "text-[0.8125rem] tracking-[0.14em]"
                  : "text-[0.8125rem] tracking-[0.14em] sm:text-[0.9375rem] sm:tracking-[0.2em]",
                onDark ? "text-white" : "text-ink",
              )}
            >
              {wordmark}
            </span>
            <span
              className={cn(
                "mt-1.5 hidden text-[0.625rem] tracking-[0.22em] uppercase transition-colors sm:block",
                onDark ? "text-bronze-2" : "text-bronze",
              )}
            >
              {wordmarkSub}
            </span>
          </span>
        </Link>

        <nav aria-label={labels.primaryNav} className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = isBNavActive(pathname, item);

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative block py-1 text-[0.6875rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors",
                      onDark
                        ? isActive
                          ? "text-white"
                          : "text-white/65 hover:text-white"
                        : isActive
                          ? "text-ink"
                          : "text-ink/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-1 left-0 h-px w-full transition-opacity",
                        onDark ? "bg-bronze-2" : "bg-bronze",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav
            aria-label={labels.language}
            className="hidden items-center gap-1.5 sm:flex"
          >
            {locales.map((item, index) => {
              const isCurrent = item === locale;
              const href = replaceLocaleInPath(pathname, item);

              return (
                <span key={item} className="flex items-center">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "px-1.5 text-xs",
                        onDark ? "text-white/30" : "text-rule-2",
                      )}
                    >
                      /
                    </span>
                  )}
                  <Link
                    href={href}
                    hrefLang={item}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={(event) => {
                      // query / hash 가 있을 때만 보존해서 이동한다.
                      const { search, hash } = window.location;
                      if (search || hash) {
                        event.preventDefault();
                        router.push(`${href}${search}${hash}`);
                      }
                    }}
                    className={cn(
                      "text-[0.6875rem] font-semibold tracking-[0.14em] transition-colors",
                      onDark
                        ? isCurrent
                          ? "text-white"
                          : "text-white/50 hover:text-white"
                        : isCurrent
                          ? "text-ink"
                          : "text-quiet hover:text-ink",
                    )}
                  >
                    {item.toUpperCase()}
                  </Link>
                </span>
              );
            })}
          </nav>

          <Link
            href={ctaHref}
            className={cn(
              "hidden px-6 py-3 text-[0.6875rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors lg:inline-block",
              onDark
                ? "bg-bronze text-white hover:bg-bronze-2 hover:text-ink"
                : "bg-ink text-white hover:bg-ink-3",
            )}
          >
            {labels.cta}
          </Link>

          <button
            type="button"
            aria-label={isOpen ? labels.closeMenu : labels.openMenu}
            aria-expanded={isOpen}
            aria-controls={PANEL_ID}
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "flex h-11 w-11 items-center justify-center transition-colors xl:hidden",
              onDark ? "text-white" : "text-ink",
            )}
          >
            <span aria-hidden="true" className="relative block h-3.5 w-7">
              <span
                className={cn(
                  "absolute left-0 block h-px w-7 bg-current transition-transform duration-200",
                  isOpen ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute top-3.5 left-0 block h-px bg-current transition-all duration-200",
                  isOpen ? "w-7 -translate-y-2 -rotate-45" : "w-4",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴: 화면 전체를 덮고, 본문과 같은 번호·세리프 어휘를 쓴다. */}
      {isOpen && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label={labels.mobileMenu}
          className="fixed inset-0 -z-10 overflow-y-auto bg-midnight pt-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,rgba(168,130,63,0.22),transparent_60%)]"
          />

          <nav
            aria-label={labels.mobileMenu}
            className="relative px-6 pb-16 sm:px-10"
          >
            <ul className="border-t border-white/15">
              {navItems.map((item, index) => {
                const isActive = isBNavActive(pathname, item);

                return (
                  <li key={item.key} className="border-b border-white/15">
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-baseline gap-5 py-5"
                    >
                      <span
                        aria-hidden="true"
                        className="font-serif text-xs font-bold tabular-nums text-bronze-2"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-serif text-2xl font-bold",
                          isActive ? "text-bronze-2" : "text-white",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
              <nav
                aria-label={labels.language}
                className="flex items-center gap-2"
              >
                {locales.map((item, index) => {
                  const isCurrent = item === locale;
                  const href = replaceLocaleInPath(pathname, item);

                  return (
                    <span key={item} className="flex items-center">
                      {index > 0 && (
                        <span aria-hidden="true" className="px-2 text-white/30">
                          /
                        </span>
                      )}
                      <Link
                        href={href}
                        hrefLang={item}
                        aria-current={isCurrent ? "true" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-sm font-semibold tracking-[0.14em]",
                          isCurrent ? "text-white" : "text-white/60",
                        )}
                      >
                        {item.toUpperCase()}
                      </Link>
                    </span>
                  );
                })}
              </nav>

              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className="bg-bronze px-7 py-4 text-[0.6875rem] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-bronze-2 hover:text-ink"
              >
                {labels.cta}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
