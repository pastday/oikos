import { en } from "./dictionaries/en";
import { ko, type Dictionary } from "./dictionaries/ko";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { ko, en };

/**
 * locale 에 해당하는 UI 문자열 사전을 반환한다.
 * 사전은 정적 객체이므로 별도의 비동기 로딩이 필요 없다.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
