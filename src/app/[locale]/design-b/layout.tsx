import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FooterB } from "@/components/site-b/FooterB";
import { HeaderB } from "@/components/site-b/HeaderB";
import { bPath, getBNav } from "@/components/site-b/paths";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

/**
 * 디자인 B안(교수 검토용 preview)의 공통 껍데기.
 *
 * ## 이 아래에 있는 것
 *
 * `/ko/design-b` 부터 시작하는 **공개 사이트 한 벌 전체**다.
 * 홈·대학원 소개·교수진·과정·MBA·DBA·학위/인증·입학안내·FAQ·입학상담·설명회 신청까지
 * A안과 같은 페이지를 모두 갖추되 디자인만 다르다.
 *
 * ## 무엇을 공유하는가
 *
 * DB·Prisma·CMS 조회·Media·Server Action·입력 검증은 **A안과 똑같은 코드**를 쓴다.
 * 복제하지 않는다. (13단계 지시 26·27·28항)
 * 갈라지는 것은 이 layout 아래의 표현 계층뿐이다.
 *
 * ## 검색엔진
 *
 * 여기 있는 모든 페이지는 `noindex, nofollow` 다. 각 페이지도 개별적으로 같은 값을
 * 설정하지만(`buildDesignBMetadata`), layout 에도 두어 새 페이지를 추가할 때
 * 실수로 색인되는 일이 없게 한다.
 */

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

type DesignBLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DesignBLayout({
  children,
  params,
}: DesignBLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const navItems = getBNav(locale, dict);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-60 focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {dict.header.skipToContent}
      </a>

      <HeaderB
        locale={locale}
        navItems={navItems}
        ctaHref={bPath(locale, "/consultation")}
        wordmark={dict.site.wordmark}
        wordmarkSub={dict.site.wordmarkSub}
        labels={{
          cta: dict.header.cta,
          logoAlt: dict.header.logoAlt,
          primaryNav: dict.header.primaryNavLabel,
          openMenu: dict.header.openMenu,
          closeMenu: dict.header.closeMenu,
          mobileMenu: dict.header.mobileMenuLabel,
          language: dict.header.languageLabel,
        }}
      />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <FooterB locale={locale} dict={dict} quickLinks={navItems.slice(1)} />
    </div>
  );
}
