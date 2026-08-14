import type { Locale } from "@/i18n/config";

/**
 * 과정 관련 수치의 단일 출처.
 *
 * 개강월·학기수·학점·등록금처럼 여러 페이지에 반복 등장하고 변경 가능성이 높은 값은
 * 여기에만 두고 각 페이지가 참조한다. (CLAUDE.md 9항 - 하드코딩 금지)
 *
 * 모든 값의 출처는 `docs/source/대학원 및 전공 소개.odt` 와 모집 이미지이며,
 * 원본에 없는 값은 만들지 않는다. 원본에 값이 비어 있으면 null 로 둔다.
 * 이후 단계에서 Program / SiteSetting 테이블로 옮긴다.
 */

/** 모집 이미지 기준 개강 시점 */
export const intake = { year: 2026, month: 10 } as const;

export const mbaFacts = {
  semesters: 4,
  totalCredits: 36,
  majorCredits: 24,
  commonCredits: 12,
  chapelCourses: 3,
  coursesPerSemester: 3,
  creditsPerSemester: 9,
  tuition: 3_000_000,
} as const;

export const dbaFacts = {
  semesters: 6,
  totalCredits: 45,
  majorCredits: 30,
  commonCredits: 15,
  chapelCourses: 4,
  coursesPerSemester: 3,
  creditsPerSemester: 9,
  tuition: 3_600_000,
  /** 원본: "6학기: 논문학기" */
  thesisSemester: 6,
} as const;

export const fees = {
  admissionReview: 480_000,
  administrative: 120_000,
  /** 원본 표에 금액이 "-" 로만 표기되어 있어 확정된 값이 없다. 임의로 만들지 않는다. */
  lms: null,
} as const;

/** 원본 등록금 표의 환율 기준 (1달러 = 1,200원) */
export const exchangeRateBase = 1_200;

/** 개강 시점을 locale 표기로 변환한다. */
export function formatIntake(locale: Locale): string {
  return locale === "ko"
    ? `${intake.year}년 ${intake.month}월`
    : new Date(intake.year, intake.month - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
}

/** 원화 금액을 locale 표기로 변환한다. */
export function formatKrw(amount: number, locale: Locale): string {
  const formatted = amount.toLocaleString("en-US");
  return locale === "ko" ? `${formatted}원` : `KRW ${formatted}`;
}
