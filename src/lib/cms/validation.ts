import { z } from "zod";

/**
 * CMS 입력 검증.
 *
 * 관리자 화면에서 들어온 값을 그대로 Prisma 에 넘기지 않는다.
 * 여기서 통과한 필드만 저장 대상이 된다. (allowlist)
 *
 * 길이 제한은 DB 가 text 라 사실상 무제한인 것을 막기 위한 것이다.
 * 이름·직책처럼 짧은 값과 경력·설명처럼 긴 값을 구분해 둔다.
 */

const SHORT = 200;
const LONG = 5000;

/** 필수 짧은 텍스트 */
const requiredShort = z.string().trim().min(1).max(SHORT);

/** 선택 짧은 텍스트. 빈 문자열은 null 로 저장한다. */
const optionalShort = z
  .string()
  .trim()
  .max(SHORT)
  .transform((value) => (value.length === 0 ? null : value));

/** 선택 긴 텍스트 */
const optionalLong = z
  .string()
  .trim()
  .max(LONG)
  .transform((value) => (value.length === 0 ? null : value));

/**
 * 선택 정수.
 *
 * 빈 값은 null 로 둔다. 원본 자료에 값이 없는 항목을 0 으로 채우지 않기 위해서다.
 * 음수와 비현실적으로 큰 값은 막는다.
 */
function optionalInt(max: number) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : Number(value)))
    .refine(
      (value) =>
        value === null || (Number.isInteger(value) && value >= 0 && value <= max),
      "0 이상의 정수만 입력할 수 있습니다.",
    );
}

/** 체크박스. 체크되면 "on" 이 온다. */
const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

const sortOrder = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? 0 : Number(value)))
  .refine(
    (value) => Number.isInteger(value) && value >= -9999 && value <= 9999,
    "표시순서는 정수여야 합니다.",
  );

// ---------------------------------------------------------------------------

export const facultyTypes = [
  "CHIEF_PROFESSOR",
  "PROFESSOR",
  "VISITING_PROFESSOR",
] as const;

export const facultySchema = z.object({
  type: z.enum(facultyTypes),
  nameKo: requiredShort,
  nameEn: optionalShort,
  titleKo: optionalShort,
  titleEn: optionalShort,
  majorKo: optionalShort,
  majorEn: optionalShort,
  careerKo: optionalLong,
  careerEn: optionalLong,
  lectureFieldsKo: optionalLong,
  lectureFieldsEn: optionalLong,
  /** 업로드 기능은 아직 없다. 관리자가 URL 을 직접 넣는 경우만 지원한다. */
  photoUrl: optionalShort,
  sortOrder,
  isPublished: checkbox,
});

export type FacultyInput = z.infer<typeof facultySchema>;

// ---------------------------------------------------------------------------

/**
 * 과정 수정.
 *
 * `type` 은 여기 없다. MBA / DBA 두 과정만 존재하고 새로 만들거나 종류를 바꿀 수 없다.
 * 관리자는 내용만 고친다.
 */
export const programSchema = z.object({
  nameKo: requiredShort,
  nameEn: optionalShort,
  descriptionKo: optionalLong,
  descriptionEn: optionalLong,
  // 학기 수·학점은 원본 자료에 불일치가 있어 nullable 이다. 비워 둘 수 있다.
  durationSemesters: optionalInt(20),
  totalCredits: optionalInt(200),
  majorCredits: optionalInt(200),
  commonCredits: optionalInt(200),
  chapelCourses: optionalInt(50),
  classMethodKo: optionalLong,
  classMethodEn: optionalLong,
  graduationRequirementsKo: optionalLong,
  graduationRequirementsEn: optionalLong,
  careerKo: optionalLong,
  careerEn: optionalLong,
  isPublished: checkbox,
});

export type ProgramInput = z.infer<typeof programSchema>;

// ---------------------------------------------------------------------------

export const courseCategories = [
  "MAJOR",
  "COMMON",
  "CHAPEL",
  "OTHER",
] as const;

export const courseSchema = z.object({
  programId: z.string().trim().min(1).max(64),
  /** 원본에 학기차가 없는 과목이 있어 비워 둘 수 있다. */
  semester: optionalInt(20).refine(
    (value) => value === null || value >= 1,
    "학기는 1 이상이어야 합니다.",
  ),
  credits: optionalInt(30),
  category: z.enum(courseCategories),
  titleKo: requiredShort,
  /** 원본에 영문 과목명이 없는 과목이 있다. 없으면 화면에서 한국어 원표기를 그대로 쓴다. */
  titleEn: optionalShort,
  descriptionKo: optionalLong,
  descriptionEn: optionalLong,
  sortOrder,
  isPublished: checkbox,
});

export type CourseInput = z.infer<typeof courseSchema>;

// ---------------------------------------------------------------------------

/** FormData 를 스키마가 기대하는 평범한 객체로 바꾼다. */
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }

  return result;
}

/** 저장 결과. 화면은 이 값만 보고 안내를 그린다. */
export type CmsFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

export const CMS_GENERIC_ERROR =
  "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
export const CMS_INVALID_ERROR = "입력값을 확인해 주세요.";
export const CMS_NOT_FOUND_ERROR = "대상을 찾을 수 없습니다.";

// ---------------------------------------------------------------------------
// 페이지 콘텐츠 (10단계)
// ---------------------------------------------------------------------------

/**
 * 화면에 **아예 없을 수도 있는** 텍스트 칸.
 *
 * 섹션마다 쓰는 슬롯이 다르므로 폼은 카탈로그가 정한 칸만 그린다.
 * 그래서 나머지 슬롯은 FormData 에 키 자체가 없다.
 * `optionalLong` 은 키가 있어야 통과하므로 그대로 쓰면 **모든 섹션 저장이 실패한다.**
 * 값이 없는 것과 칸이 없는 것을 똑같이 null 로 본다.
 */
const absentAsNull = z
  .string()
  .trim()
  .max(LONG)
  .optional()
  .transform((value) => (value === undefined || value.length === 0 ? null : value));

/**
 * 섹션 텍스트 슬롯.
 *
 * 어떤 슬롯이 실제로 저장되는지는 **카탈로그가 정한다.** 여기서는 모든 슬롯을
 * 선택 항목으로 두고, 액션이 카탈로그에 정의된 슬롯만 골라 저장한다. (allowlist)
 * 화면에 없는 슬롯에 값을 밀어 넣어도 무시된다.
 */
export const pageSectionSchema = z.object({
  titleKo: absentAsNull,
  titleEn: absentAsNull,
  subtitleKo: absentAsNull,
  subtitleEn: absentAsNull,
  bodyKo: absentAsNull,
  bodyEn: absentAsNull,
  highlightKo: absentAsNull,
  highlightEn: absentAsNull,
  noteKo: absentAsNull,
  noteEn: absentAsNull,
  isPublished: checkbox,
});

export type PageSectionInput = z.infer<typeof pageSectionSchema>;

/** 섹션 안의 반복 항목. `variant` 는 카탈로그가 허용한 값인지 액션에서 다시 확인한다. */
export const pageSectionItemSchema = z.object({
  // 라벨을 쓰지 않는 목록(등록금 비고)과 표시 형태가 없는 목록에서는
  // 폼이 해당 칸을 그리지 않아 FormData 에 키가 없다. 위 `absentAsNull` 주석 참고.
  labelKo: absentAsNull,
  labelEn: absentAsNull,
  valueKo: absentAsNull,
  valueEn: absentAsNull,
  variant: absentAsNull,
  sortOrder,
  isPublished: checkbox,
});

export type PageSectionItemInput = z.infer<typeof pageSectionItemSchema>;

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

/**
 * FAQ.
 *
 * 한국어 질문·답변은 필수다. 영어가 비어 있으면 영문 페이지에서 한국어를 그대로 보여준다.
 * (없는 번역을 지어내지 않는다는 기존 정책. `pickLocale` 참고)
 */
export const faqSchema = z.object({
  questionKo: z.string().trim().min(1).max(LONG),
  questionEn: optionalLong,
  answerKo: z.string().trim().min(1).max(LONG),
  answerEn: optionalLong,
  sortOrder,
  isPublished: checkbox,
});

export type FaqInput = z.infer<typeof faqSchema>;

// ---------------------------------------------------------------------------
// 입학안내 수치
// ---------------------------------------------------------------------------

/**
 * 등록금·수수료·개강 시점의 값 하나.
 *
 * **빈 값을 허용한다.** 원본 자료에 금액이 없는 항목(LMS 사용료)이 실제로 있고,
 * 임의로 0 이나 추정치를 채우지 않는 것이 이 프로젝트의 정책이다. (CLAUDE.md 23항)
 * 저장은 문자열로 하되, 숫자로 읽을 수 없는 값은 막는다.
 */
export const admissionNumberSchema = z
  .string()
  .trim()
  .max(20)
  .refine((value) => {
    if (value.length === 0) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  }, "숫자만 입력할 수 있습니다. 값이 없으면 비워 두세요.")
  .transform((value) => (value.length === 0 ? null : value));
