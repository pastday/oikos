import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { externalLinks } from "@/lib/site-links";
import { BButton } from "./BBlocks";
import { BContainer } from "./BLayout";
import { BEyebrow } from "./BType";
import { bPath } from "./paths";

/**
 * B안 Footer.
 *
 * ## A안과 무엇이 다른가
 *
 * A안은 4열 격자 안에 워드마크·설명·바로가기·외부링크를 나란히 넣는다.
 * B안은 **워드마크를 지면 폭만큼 키워 한 층을 통째로 쓰고**, 그 아래 선을 그은 뒤
 * 메뉴를 주제별로 세 묶음으로 나눈다. 마지막 층에 저작권과 상담 버튼을 둔다.
 * 페이지의 마지막이 로고로 닫히는 구성이라 대학 홈페이지의 마무리처럼 읽힌다.
 *
 * ## 없는 정보는 만들지 않는다
 *
 * 주소·전화·이메일·SNS 는 아직 확정된 값이 없어 넣지 않는다. (CLAUDE.md 23항)
 * 묶음 제목도 새로 짓지 않고 **이미 쓰고 있는 메뉴 이름**을 그대로 쓴다.
 */

export type BFooterGroup = {
  key: string;
  title: string;
  links: { key: string; href: string; label: string }[];
};

export function BFooter({
  locale,
  dict,
  groups,
}: {
  locale: Locale;
  dict: Dictionary;
  groups: BFooterGroup[];
}) {
  return (
    <footer className="mt-auto bg-midnight text-white/65">
      <BContainer className="pt-20 pb-12 lg:pt-28">
        {/* 1층: 워드마크 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
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
              <BEyebrow tone="dark">{dict.site.wordmarkSub}</BEyebrow>
            </div>

            <p className="mt-7 font-serif text-4xl font-bold tracking-[0.06em] text-white sm:text-5xl lg:text-6xl">
              {dict.site.wordmark}
            </p>
          </div>

          <p className="max-w-sm text-sm leading-relaxed">
            {dict.footer.description}
          </p>
        </div>

        {/* 2층: 메뉴 묶음 + 외부 링크 */}
        <div className="mt-16 grid gap-10 border-t border-white/15 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.key}>
              <h2 className="text-[0.625rem] font-semibold tracking-[0.22em] text-bronze-2 uppercase">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
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
          ))}

          <div>
            <h2 className="text-[0.625rem] font-semibold tracking-[0.22em] text-bronze-2 uppercase">
              {dict.footer.externalLinks}
            </h2>
            <ul className="mt-5 space-y-3">
              {externalLinks.map((link) => (
                <li key={link.key}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    // 공식 URL 이 확인되기 전까지는 링크로 만들지 않는다.
                    <span className="text-sm text-white/60">
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

        {/* 3층: 저작권 + 상담 */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} {dict.footer.copyright}
          </p>

          <BButton href={bPath(locale, "/consultation")} tone="onDark">
            {dict.header.cta}
          </BButton>
        </div>
      </BContainer>
    </footer>
  );
}
