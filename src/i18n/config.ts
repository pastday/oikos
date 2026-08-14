/** 사이트가 지원하는 언어. 순서는 언어 전환 UI 표시 순서와 같다. */
export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];

/** 기본 언어. `/` 로 접속하면 이 언어로 이동한다. */
export const defaultLocale: Locale = "ko";

/** `<html lang>` 및 Open Graph 에 사용할 값 */
export const htmlLang: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
