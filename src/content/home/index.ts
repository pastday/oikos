import type { Locale } from "@/i18n/config";
import { homeEn } from "./en";
import { homeKo } from "./ko";
import type { HomeContent } from "./types";

const homeContent: Record<Locale, HomeContent> = { ko: homeKo, en: homeEn };

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}

export type { HomeContent };
