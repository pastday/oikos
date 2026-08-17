import type { FacultyType, ProgramType } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";

/**
 * 공개 화면이 사용하는 CMS 데이터 형태.
 *
 * DB 행을 그대로 넘기지 않고 **locale 하나로 이미 정리된 값**만 담는다.
 * 이렇게 하면 화면 컴포넌트가 Ko/En 분기나 fallback 규칙을 알 필요가 없다.
 */

/**
 * 영어 값이 비어 있으면 한국어 값을 그대로 쓴다.
 *
 * 원본 자료에 영문명이 없는 교과목이 실제로 있고, 그럴 때 **영문명을 새로 만들지 않고
 * 한국어 원표기를 그대로 노출**하는 것이 이 프로젝트의 정책이다. (docs/decisions.md 5단계)
 * 관리자가 영문을 아직 입력하지 않은 경우에도 같은 규칙이 적용된다.
 */
export function pickLocale(
  locale: Locale,
  ko: string,
  en: string | null | undefined,
): string {
  if (locale === "ko") return ko;
  const trimmed = en?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : ko;
}

/** 값이 없으면 null. 화면에서 "준비 중" 같은 안내로 대체한다. */
export function pickLocaleOptional(
  locale: Locale,
  ko: string | null,
  en: string | null,
): string | null {
  const primary = locale === "ko" ? ko : (en ?? ko);
  const trimmed = primary?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

// ---------------------------------------------------------------------------

export type FacultyView = {
  id: string;
  type: FacultyType;
  /** 현재 locale 기준 이름 */
  name: string;
  /** 다른 언어 이름. 없으면 null (같은 값이면 중복 표시하지 않는다) */
  nameAlt: string | null;
  title: string | null;
  major: string | null;
  career: string | null;
  lectureFields: string | null;
  photoUrl: string | null;
  /** 이니셜 아바타용. 사진이 없을 때 쓴다. */
  initials: string;
};

export type FacultyGroup = {
  type: FacultyType;
  members: FacultyView[];
};

// ---------------------------------------------------------------------------

/** 과정의 수치. 여러 페이지가 함께 참조하므로 별도 타입으로 둔다. */
export type ProgramNumbers = {
  durationSemesters: number | null;
  totalCredits: number | null;
  majorCredits: number | null;
  commonCredits: number | null;
  chapelCourses: number | null;
};

export type ProgramView = ProgramNumbers & {
  id: string;
  type: ProgramType;
  name: string;
  description: string | null;
  classMethod: string | null;
  graduationRequirements: string | null;
  career: string | null;
};

// ---------------------------------------------------------------------------

export type CourseView = {
  id: string;
  title: string;
  /** 다른 언어 과목명. 같거나 없으면 null */
  titleAlt: string | null;
  credits: number | null;
  description: string | null;
};

/** 학기차가 지정된 전공과목 묶음 */
export type SemesterGroup = {
  semester: number;
  courses: CourseView[];
};

export type ProgramCurriculum = {
  /** 원본에 학기차가 명시된 전공과목 */
  bySemester: SemesterGroup[];
  /** 학기차가 지정되지 않은 전공과목 */
  additionalMajor: CourseView[];
  /** 공통과목 */
  common: CourseView[];
};
