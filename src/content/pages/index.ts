import type { Locale } from "@/i18n/config";
import { pagesEn } from "./en";
import { pagesKo } from "./ko";
import type { PageContent } from "./types";

const pages: Record<Locale, PageContent> = { ko: pagesKo, en: pagesEn };

export function getPageContent(locale: Locale): PageContent {
  return pages[locale];
}

export type * from "./types";
