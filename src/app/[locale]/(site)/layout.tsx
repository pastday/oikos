import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

/**
 * A안(정식 공개 사이트)의 공통 껍데기.
 *
 * 13단계에서 root layout 을 `<html>`/`<body>` 만 남기고 이 layout 을 새로 만들었다.
 * **route group `(site)` 는 주소에 나타나지 않으므로 공개 URL 은 그대로다.**
 * (`/ko`, `/ko/about`, `/ko/programs/mba` …)
 *
 * Header·Footer·본문 구조는 이전 root layout 에 있던 것을 그대로 옮긴 것이다.
 * B안(`../design-b`)은 자기만의 Header/Footer 를 쓰므로 이 파일과 무관하다.
 */

type SiteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {dict.header.skipToContent}
      </a>

      <Header locale={locale} dict={dict} />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
