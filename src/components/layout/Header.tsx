import Image from "next/image";
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
 * 데스크톱은 2행 구조를 사용한다.
 *   1행: 로고 + 언어 전환 + 입학상담 CTA
 *   2행: 주요 메뉴
 * 메뉴 7개와 CTA 를 한 줄에 넣으면 영문에서 폭이 부족해 CTA 가 잘리기 때문이며,
 * 대학 홈페이지에서 일반적으로 쓰이는 형태이기도 하다.
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
          {/* 로고: 제공된 공식 로고에서 문장(seal)만 잘라낸 서비스용 사본 */}
          <Link
            href={localePath(locale, "")}
            className="flex shrink-0 items-center gap-2.5"
          >
            <Image
              src="/images/oikos-seal.png"
              alt={dict.header.logoAlt}
              width={295}
              height={220}
              priority
              className="h-9 w-auto sm:h-10"
            />
            <span className="flex flex-col justify-center leading-none">
              <span className="font-serif text-[0.9375rem] font-bold tracking-[0.1em] text-navy sm:text-base">
                {dict.site.wordmark}
              </span>
              <span className="mt-1 text-[0.6875rem] tracking-wide text-muted">
                {dict.site.wordmarkSub}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher
              currentLocale={locale}
              label={dict.header.languageLabel}
              className="hidden sm:flex"
            />

            <Link
              href={consultationHref}
              className="hidden rounded-md bg-navy px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy-soft xl:inline-block"
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

      {/* 2행: 데스크톱 주요 메뉴 */}
      <div className="hidden border-t border-line xl:block">
        <Container>
          <DesktopNav items={navItems} label={dict.header.primaryNavLabel} />
        </Container>
      </div>
    </header>
  );
}
