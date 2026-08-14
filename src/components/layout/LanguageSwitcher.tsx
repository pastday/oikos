"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * 현재 경로를 유지한 채 언어만 바꾼다.
 * 예: /ko/programs/mba 에서 EN 선택 -> /en/programs/mba
 *
 * href 는 pathname 만으로 만들기 때문에 JS 없이도 정상 동작한다.
 * query string 과 hash 는 클릭 시점에 붙여 보존한다.
 * (useSearchParams 를 쓰면 레이아웃 전체가 Suspense 경계를 요구하므로 사용하지 않는다.)
 */
function replaceLocale(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  // pathname 은 "/ko/about" 형태이므로 segments[1] 이 locale 이다.
  if (segments.length > 1 && (locales as readonly string[]).includes(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/");
  }
  return `/${nextLocale}`;
}

export function LanguageSwitcher({
  currentLocale,
  label,
  className,
}: {
  currentLocale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label={label} className={cn("flex items-center gap-1", className)}>
      {locales.map((locale, index) => {
        const isCurrent = locale === currentLocale;
        const href = replaceLocale(pathname, locale);

        return (
          <span key={locale} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-1 text-line">
                |
              </span>
            )}
            <Link
              href={href}
              hrefLang={locale}
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
                "rounded px-1.5 py-1 text-xs font-semibold tracking-wide transition-colors",
                isCurrent
                  ? "text-navy"
                  : "text-muted hover:text-navy",
              )}
            >
              {locale.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
