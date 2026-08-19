import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/i18n";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { buildAlternates, siteUrl } from "@/lib/metadata";

/**
 * 이 파일이 사이트의 root layout 이다.
 * `<html lang>` 을 locale 에 따라 바꿔야 하는데 app/layout.tsx 에서는 locale 을 알 수 없으므로,
 * Next.js i18n 라우팅의 표준 방식대로 [locale] 세그먼트의 layout 을 root layout 으로 사용한다.
 *
 * ## 왜 Header/Footer 가 여기에 없는가 (13단계)
 *
 * 이 아래에 **디자인이 서로 다른 두 벌의 공개 사이트**가 있다.
 *
 *   `(site)/`   — A안. 정식 공개 URL(/ko, /ko/about …). route group 이므로 주소는 그대로다.
 *   `design-b/` — B안. 교수 검토용 preview(/ko/design-b …)
 *
 * 두 벌은 Header·Footer·디자인 시스템이 완전히 다르므로, 공통 껍데기(`<html>`/`<body>`)만
 * 여기에 두고 **각 사이트의 Header/Footer 는 각자의 layout** 에서 그린다.
 * DB·CMS·Media·Server Action 은 그대로 하나를 공유한다. 갈라지는 것은 표현 계층뿐이다.
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

  return (
    <html lang={htmlLang[locale]} className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
