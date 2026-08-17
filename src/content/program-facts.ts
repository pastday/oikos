import type { Locale } from "@/i18n/config";

/**
 * 아직 CMS 로 옮기지 않은 수치의 단일 출처.
 *
 * ⚠️ **학기 수 · 총학점 · 전공/공통 학점 · 채플 과목 수는 여기에 없다.**
 * 9단계에서 `Program` 테이블로 옮겼고, 이제 DB 가 유일한 출처다.
 * 화면에 필요한 값은 `getProgramNumbers()` 로 읽는다. 여기에 다시 적어 두면
 * 관리자가 CMS 에서 고친 값과 갈라지므로 절대 되돌리지 않는다.
 *
 * 여기 남은 값은 `Program` 모델에 대응 컬럼이 없어 아직 옮길 수 없는 것들이다.
 * (등록금·수수료·개강월·학기당 수강량·논문학기)
 * 이후 단계에서 `SiteSetting` 또는 `Program` 확장으로 옮긴다.
 *
 * 출처는 `docs/source/대학원 및 전공 소개.odt` 와 모집 이미지이며,
 * 원본에 없는 값은 만들지 않는다. 원본에 값이 비어 있으면 null 로 둔다.
 */

/**
 * DB 에서 읽은 수치를 문장에 넣을 때 쓴다.
 *
 * `Program` 의 학점·학기 필드는 전부 nullable 이다. 원본 자료에 불일치가 있어
 * 임의로 확정하지 않기 위한 의도적 설계이므로, 값이 없을 수 있다는 전제로 표시한다.
 */
export function n(value: number | null): string {
  return value === null ? "—" : String(value);
}

/** 모집 이미지 기준 개강 시점 */
export const intake = { year: 2026, month: 10 } as const;

export const mbaFacts = {
  coursesPerSemester: 3,
  creditsPerSemester: 9,
  tuition: 3_000_000,
} as const;

export const dbaFacts = {
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
