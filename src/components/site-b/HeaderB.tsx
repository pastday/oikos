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
 * A안 Header 와 가장 크게 다른 점은 **Hero 위에 겹쳐 놓는다**는 것이다.
 * 첫 화면에서는 배경이 비치는 투명 상태로 두어 Hero 가 화면 끝까지 이어져 보이고,
 * 스크롤하면 아이보리 바탕으로 바뀌어 글자가 읽힌다. (13단계 지시 9항)
 *
 * 그래서 이 컴포넌트는 `fixed` 이고, B안의 모든 페이지는 **상단이 어두운 영역으로 시작**한다.
 * (홈은 Hero, 상세는 PageHeroB) 두 상태 모두에서 대비가 확보된다.
 *
 * 기능은 A안과 같은 것을 모두 갖춘다.
 * 메뉴 · 현재 위치 표시 · 언어 전환 · 입학상담 CTA · 모바일 메뉴.
 * 다만 이동 대상이 전부 B안 경로다. (지시 24항)
 */

const PANEL_ID = "design-b-mobile-menu";

/** 이 높이만큼 내려가면 solid 로 바꾼다. Hero 를 벗어나기 전에 이미 바뀌면 어수선하다. */
const SOLID_AFTER_PX = 40;

export function HeaderB({
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
  const [isSolid, setIsSolid] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 스크롤 위치에 따라 배경만 바꾼다. 레이아웃은 건드리지 않으므로 재계산 비용이 없다.
  useEffect(() => {
    function handleScroll() {
      setIsSolid(window.scrollY > SOLID_AFTER_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메뉴가 열려 있는 동안에만 ESC 닫기와 배경 스크롤 잠금을 건다. (A안 MobileMenu 와 같은 방식)
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

  // 모바일 메뉴가 열려 있으면 그 자체가 어두운 면이므로 Header 도 투명 상태로 둔다.
  const onDark = !isSolid || isOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        isOpen
          ? "bg-transparent"
          : isSolid
            ? "border-b border-rule bg-paper/95 backdrop-blur-sm"
            : "border-b border-white/15 bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-site-b items-center justify-between gap-6 px-6 sm:px-10 lg:px-16">
        {/* 로고 + 워드마크 */}
        <Link
          href={navItems[0]?.href ?? "/"}
          className="flex shrink-0 items-center gap-3"
        >
          {/* 어두운 Hero 위에서도 문장이 보이도록 흰 판에 얹는다.
              로고 자체는 비율 그대로 쓰고 다시 디자인하지 않는다. (지시 11항) */}
          <span className="flex h-11 w-11 items-center justify-center bg-white">
            <Image
              src="/images/oikos-seal.png"
              alt={labels.logoAlt}
              width={295}
              height={220}
              priority
              className="h-7 w-auto"
            />
          </span>

          <span className="flex flex-col justify-center leading-none">
            <span
              className={cn(
                // 390px 에서 로고 + 워드마크 + 햄버거가 한 줄에 들어가야 한다.
                // 자간이 넓어 글자 수 대비 폭을 많이 먹으므로 작은 화면에서만 줄인다.
                "font-serif text-[0.8125rem] font-bold tracking-[0.12em] transition-colors sm:text-base sm:tracking-[0.18em]",
                onDark ? "text-white" : "text-ink",
              )}
            >
              {wordmark}
            </span>
            <span
              className={cn(
                "mt-1.5 text-[0.625rem] tracking-[0.2em] uppercase transition-colors",
                onDark ? "text-bronze-2" : "text-bronze",
              )}
            >
              {wordmarkSub}
            </span>
          </span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav aria-label={labels.primaryNav} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = isBNavActive(pathname, item);

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative block px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide whitespace-nowrap transition-colors",
                      onDark
                        ? isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : isActive
                          ? "text-ink"
                          : "text-ink/65 hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3.5 -bottom-0.5 h-px bg-bronze-2 transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* 언어 전환. 경로에서 locale 만 바꾸므로 B안 안에 머문다. */}
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
                      // query / hash 가 있을 때만 보존해서 이동한다. (A안과 같은 처리)
                      const { search, hash } = window.location;
                      if (search || hash) {
                        event.preventDefault();
                        router.push(`${href}${search}${hash}`);
                      }
                    }}
                    className={cn(
                      "text-xs font-semibold tracking-[0.1em] transition-colors",
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
              "hidden px-6 py-3 text-xs font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors lg:inline-block",
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
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-current transition-transform duration-200",
                  isOpen ? "top-2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute top-2 left-0 block h-px w-6 bg-current transition-opacity duration-200",
                  isOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-current transition-transform duration-200",
                  isOpen ? "top-2 -rotate-45" : "top-4",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴: 화면 전체를 덮는 어두운 면. 항목을 크게 두어 누르기 쉽게 한다. */}
      {isOpen && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label={labels.mobileMenu}
          className="fixed inset-0 top-0 -z-10 overflow-y-auto bg-ink pt-20"
        >
          <nav aria-label={labels.mobileMenu} className="px-6 py-8 sm:px-10">
            <ul className="flex flex-col">
              {navItems.map((item) => {
                const isActive = isBNavActive(pathname, item);

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block border-b border-white/10 py-4 font-serif text-xl transition-colors",
                        isActive
                          ? "text-bronze-2"
                          : "text-white/85 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
              <nav
                aria-label={labels.language}
                className="flex items-center gap-1.5"
              >
                {locales.map((item, index) => {
                  const isCurrent = item === locale;
                  const href = replaceLocaleInPath(pathname, item);

                  return (
                    <span key={item} className="flex items-center">
                      {index > 0 && (
                        <span aria-hidden="true" className="px-1.5 text-white/30">
                          /
                        </span>
                      )}
                      <Link
                        href={href}
                        hrefLang={item}
                        aria-current={isCurrent ? "true" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-sm font-semibold tracking-[0.1em]",
                          isCurrent ? "text-white" : "text-white/50",
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
                className="bg-bronze px-6 py-3.5 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-bronze-2 hover:text-ink"
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
