import type { Locale } from "@/i18n/config";
import { admissionEn } from "./en";
import { admissionKo } from "./ko";
import type { AdmissionContent } from "./types";

/** 입학신청 폼 문구를 locale 별로 돌려준다. (`src/content/pages` 와 같은 방식) */
export function getAdmissionContent(locale: Locale): AdmissionContent {
  return locale === "ko" ? admissionKo : admissionEn;
}

export type * from "./types";
