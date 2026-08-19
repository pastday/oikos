import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { externalLinks } from "@/lib/site-links";
import { ContainerB } from "./ContainerB";
import { bPath } from "./paths";

/**
 * B안 Footer.
 *
 * **표시하는 정보는 A안과 완전히 같다.** 주소·전화·이메일·SNS 는 아직 확정된 값이
 * 없으므로 만들지 않는다. (13단계 지시 10항, CLAUDE.md 23항)
 * 달라지는 것은 구성뿐이다. 워드마크를 지면 폭만큼 크게 두어 마무리를 만든다.
 *
 * 바로가기는 A안(4개 추림)과 달리 **B안 상단 메뉴 전체**를 그대로 쓴다.
 * B안은 Footer 도 탐색의 일부로 보기 때문이고, 이동 대상은 모두 B안 경로다.
 */
export function FooterB({
  locale,
  dict,
  quickLinks,
}: {
  locale: Locale;
  dict: Dictionary;
  quickLinks: { key: string; href: string; label: string }[];
}) {
  return (
    <footer className="mt-auto bg-ink text-white/70">
      <ContainerB className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center bg-white">
                <Image
                  src="/images/oikos-seal.png"
                  alt={dict.header.logoAlt}
                  width={295}
                  height={220}
                  className="h-9 w-auto"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-lg font-bold tracking-[0.16em] text-white">
                  {dict.site.wordmark}
                </span>
                <span className="mt-2 text-[0.6875rem] tracking-[0.2em] text-bronze-2 uppercase">
                  {dict.site.wordmarkSub}
                </span>
              </span>
            </div>

            <p className="mt-8 max-w-sm text-sm leading-relaxed">
              {dict.footer.description}
            </p>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
              {dict.footer.quickLinks}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
              {dict.footer.externalLinks}
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {externalLinks.map((link) => (
                <li key={link.key}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    // 공식 URL 이 확인되기 전까지는 링크로 만들지 않는다. (A안과 같은 정책)
                    <span className="text-white/60">
                      {link.label}
                      <span className="ml-1.5 text-xs">
                        ({dict.footer.externalLinkPending})
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <Link
              href={bPath(locale, "/consultation")}
              className="mt-8 inline-block border border-white/25 px-6 py-3 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:border-bronze-2 hover:text-bronze-2"
            >
              {dict.header.cta}
            </Link>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} {dict.footer.copyright}
          </p>
        </div>
      </ContainerB>
    </footer>
  );
}
