import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/i18n";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { buildAlternates, siteUrl } from "@/lib/metadata";

/**
 * 이 파일이 사이트의 root layout 이다.
 * `<html lang>` 을 locale 에 따라 바꿔야 하는데 app/layout.tsx 에서는 locale 을 알 수 없으므로,
 * Next.js i18n 라우팅의 표준 방식대로 [locale] 세그먼트의 layout 을 root layout 으로 사용한다.
 */

// 지원하는 locale 은 빌드 시 미리 생성한다.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * `dynamicParams = false` 를 두지 않는다.
 *
 * 그 설정이 있으면 관리자가 CMS 에서 저장한 뒤 `revalidatePath` 로 무효화한 페이지를
 * Next.js 가 다시 만들지 못하고 **404 를 돌려준다.** (실제로 겪었다)
 *
 * 지원하지 않는 locale(/jp 등)은 이 layout 과 각 페이지의 `isLocale` 검사가
 * 이미 404 로 처리하므로 이 설정 없이도 동작이 같다.
 */

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.homeTitle,
      template: `%s | ${dict.meta.titleSuffix}`,
    },
    description: dict.meta.homeDescription,
    alternates: buildAlternates(""),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <html lang={htmlLang[locale]} className="h-full">
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
