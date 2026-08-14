import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import { htmlLang, locales, type Locale } from "@/i18n/config";

/** 운영 도메인. 로컬 개발 시에는 .env 의 SITE_URL 을 사용한다. */
export const siteUrl = process.env.SITE_URL ?? "https://oikos.pastday.co.kr";

/**
 * 한/영 페이지가 검색엔진에서 서로 대응 관계로 인식되도록
 * canonical 과 languages(hreflang) 를 함께 만든다.
 *
 * @param path locale prefix 를 제외한 경로. 홈은 "" 를 넘긴다. 예: "/programs/mba"
 */
export function buildAlternates(path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `/${locale}${path}`;
  }

  return { languages };
}

type PageMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
};

/** 각 페이지에서 반복되는 metadata 구성을 한곳에 모은다. */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const dict = getDictionary(locale);
  const resolvedDescription = description ?? dict.meta.pageDescription;
  const canonical = `/${locale}${path}`;

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical,
      ...buildAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: dict.site.name,
      title,
      description: resolvedDescription,
      url: canonical,
      locale: htmlLang[locale].replace("-", "_"),
    },
  };
}
