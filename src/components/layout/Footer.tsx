import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { footerQuickNavKeys, localePath, mainNavItems } from "@/lib/navigation";
import { externalLinks } from "@/lib/site-links";
import { Container } from "./Container";

/**
 * 사이트 공통 Footer.
 *
 * 대표 연락처(전화·이메일·주소)는 아직 확정되지 않았으므로 표시하지 않는다.
 * 임의의 연락처를 만들어내지 않는다. (CLAUDE.md 23항)
 * 확정되면 SiteSetting DB 에서 읽어 이 영역에 추가한다.
 */
export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const quickLinks = footerQuickNavKeys.map((key) => {
    const item = mainNavItems.find((navItem) => navItem.key === key);
    return {
      key,
      href: localePath(locale, item?.path ?? ""),
      label: dict.nav[key],
    };
  });

  return (
    <footer className="mt-auto bg-navy text-white/80">
      <Container className="py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <p className="font-serif text-lg font-bold tracking-[0.12em] text-white">
              {dict.site.wordmark}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              {dict.footer.quickLinks}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-gold-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              {dict.footer.externalLinks}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {externalLinks.map((link) => (
                <li key={link.key}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-gold-soft"
                    >
                      {link.label}
                    </a>
                  ) : (
                    // 공식 URL 이 확인되기 전까지는 링크로 만들지 않는다.
                    <span className="text-white/45">
                      {link.label}
                      <span className="ml-1.5 text-xs">
                        ({dict.footer.externalLinkPending})
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <p className="text-xs text-white/55">
            &copy; {new Date().getFullYear()} {dict.footer.copyright}
          </p>
        </div>
      </Container>
    </footer>
  );
}
