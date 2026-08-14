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

// 지원하는 locale 만 미리 생성하고, 그 외 값(/jp, /fr 등)은 404 로 처리한다.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

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
