import type { ProgramType } from "@/generated/prisma/enums";
import type { ProgramNumbers } from "@/lib/cms/types";
import type { Locale } from "@/i18n/config";
import { createPagesEn } from "./en";
import { createPagesKo } from "./ko";
import type { PageContent } from "./types";

/**
 * 상세 페이지의 **문구**를 돌려준다.
 *
 * 9단계부터 학기 수·학점 같은 과정 수치는 DB(`Program`)가 유일한 출처다.
 * 문구 안에 그 수치가 섞여 있는 문장이 많아(예: "4학기제 · 총 36학점")
 * 콘텐츠를 상수가 아니라 **수치를 받아 만드는 함수**로 바꿨다.
 *
 * 이렇게 하지 않으면 관리자가 CMS 에서 학점을 고쳐도 FAQ·입학안내 문구는
 * 예전 숫자를 그대로 보여주게 된다. 같은 값이 두 곳에서 갈라지는 구조를 만들지 않는다.
 *
 * 수치는 `getProgramNumbers()` 로 읽어 넘긴다.
 */
export function getPageContent(
  locale: Locale,
  programNumbers: Record<ProgramType, ProgramNumbers>,
): PageContent {
  return locale === "ko"
    ? createPagesKo(programNumbers)
    : createPagesEn(programNumbers);
}

export type * from "./types";
