import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BFooter, type BFooterGroup } from "@/components/site-b/BFooter";
import { BHeader } from "@/components/site-b/BHeader";
import { bPath, getBNav } from "@/components/site-b/paths";
import { getDictionary, type Dictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * 디자인 B안(교수 검토용 preview)의 공통 껍데기.
 *
 * ## 이 아래에 있는 것
 *
 * `/ko/design-b` 부터 시작하는 **공개 사이트 한 벌 전체**다.
 * 홈·대학원 소개·교수진·과정·MBA·DBA·학위/인증·입학안내·FAQ·입학상담·설명회 신청까지
 * A안과 같은 페이지를 모두 갖추되 **디자인 시스템이 완전히 다르다.**
 *
 * ## 무엇을 공유하는가
 *
 * DB·Prisma·CMS 조회·Media·Server Action·입력 검증은 **A안과 똑같은 코드**를 쓴다.
 * 복제하지 않는다. 갈라지는 것은 이 layout 아래의 표현 계층뿐이며,
 * 그 표현 계층은 `components/site-b` 안에서 A안 컴포넌트를 쓰지 않고 새로 만든 것이다.
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

/**
 * Footer 의 메뉴 묶음.
 *
 * 묶음 제목을 새로 짓지 않는다. **이미 화면에서 쓰고 있는 메뉴 이름**을 그대로 쓴다.
 * (없는 문구를 만들지 않는다는 원칙 — CLAUDE.md 23항)
 */
function buildFooterGroups(locale: Locale, dict: Dictionary): BFooterGroup[] {
  return [
    {
      key: "about",
      title: dict.nav.about,
      links: [
        { key: "about", href: bPath(locale, "/about"), label: dict.nav.about },
        {
          key: "faculty",
          href: bPath(locale, "/faculty"),
          label: dict.nav.faculty,
        },
        {
          key: "degree",
          href: bPath(locale, "/degree"),
          label: dict.nav.degree,
        },
      ],
    },
    {
      key: "programs",
      title: dict.nav.programs,
      links: [
        {
          key: "programs",
          href: bPath(locale, "/programs"),
          label: dict.nav.programs,
        },
        {
          key: "mba",
          href: bPath(locale, "/programs/mba"),
          label: dict.pages.mba.title,
        },
        {
          key: "dba",
          href: bPath(locale, "/programs/dba"),
          label: dict.pages.dba.title,
        },
      ],
    },
    {
      key: "admission",
      title: dict.nav.admission,
      links: [
        {
          key: "admission",
          href: bPath(locale, "/admission"),
          label: dict.nav.admission,
        },
        { key: "faq", href: bPath(locale, "/faq"), label: dict.pages.faq.title },
        {
          key: "consultation",
          href: bPath(locale, "/consultation"),
          label: dict.nav.consultation,
        },
      ],
    },
  ];
}

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

      <BHeader
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

      <BFooter
        locale={locale}
        dict={dict}
        groups={buildFooterGroups(locale, dict)}
      />
    </div>
  );
}
