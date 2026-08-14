import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { getMainNav, localePath } from "@/lib/navigation";
import { Container } from "./Container";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

/**
 * 사이트 공통 Header. Server Component 로 두고,
 * 현재 경로나 열림 상태가 필요한 부분만 Client Component 로 분리한다.
 *
 * 로고는 원본 로고 자료가 프로젝트에 제공되기 전까지 임시 텍스트 워드마크로 둔다.
 * TODO(자료 제공 후): assets/source 의 공식 로고로 교체한다.
 */
export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navItems = getMainNav(locale, dict);
  const consultationHref = localePath(locale, "/consultation");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 로고 (임시 텍스트) */}
          <Link
            href={localePath(locale, "")}
            className="flex shrink-0 flex-col justify-center leading-none"
          >
            <span className="font-serif text-base font-bold tracking-[0.12em] text-navy sm:text-lg">
              {dict.site.wordmark}
            </span>
            <span className="mt-0.5 text-[0.6875rem] tracking-wide text-muted">
              {dict.site.wordmarkSub}
            </span>
          </Link>

          <DesktopNav items={navItems} label={dict.header.primaryNavLabel} />

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher
              currentLocale={locale}
              label={dict.header.languageLabel}
              className="hidden sm:flex"
            />

            <Link
              href={consultationHref}
              className="hidden rounded-md bg-navy px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy-soft lg:inline-block"
            >
              {dict.header.cta}
            </Link>

            <MobileMenu
              locale={locale}
              navItems={navItems}
              ctaHref={consultationHref}
              ctaLabel={dict.header.cta}
              openLabel={dict.header.openMenu}
              closeLabel={dict.header.closeMenu}
              menuLabel={dict.header.mobileMenuLabel}
              languageLabel={dict.header.languageLabel}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
