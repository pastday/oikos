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

/**
 * Media 참조 필드.
 *
 * 빈 값은 "연결 없음" 이라는 정상적인 상태다.
 * **여기서는 형식만 본다.** 실제로 존재하는 파일인지, 요구한 종류(이미지/PDF)가 맞는지는
 * DB 를 봐야 알 수 있으므로 액션에서 `resolveMediaId()` 로 다시 확인한다.
 */
const mediaRef = z
  .string()
  .trim()
  .max(64)
  .optional()
  .transform((value) => (value === undefined || value.length === 0 ? null : value));

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
  /**
   * 상세 프로필. 전부 선택 입력이다. (14단계)
   * 자료가 없는 교수도 이름만으로 등록할 수 있어야 하므로 필수로 만들지 않는다.
   * 경력이 20줄을 넘는 교수가 있을 수 있어 길이는 다른 긴 텍스트와 같은 한도를 쓴다.
   */
  bioKo: optionalLong,
  bioEn: optionalLong,
  educationKo: optionalLong,
  educationEn: optionalLong,
  careerKo: optionalLong,
  careerEn: optionalLong,
  lectureFieldsKo: optionalLong,
  lectureFieldsEn: optionalLong,
  /** 12단계부터 URL 문자열이 아니라 Media 참조다. 존재 여부는 액션에서 확인한다. */
  photoMediaId: mediaRef,
  sortOrder,
  isPublished: checkbox,
});

export type FacultyInput = z.infer<typeof facultySchema>;

// ---------------------------------------------------------------------------
// 교수 저서 · 언론보도 (15단계)
// ---------------------------------------------------------------------------

/**
 * 외부 링크.
 *
 * **`http` / `https` 만 허용한다.** 관리자가 입력한 값이 그대로 `<a href>` 에 들어가므로
 * `javascript:` `data:` 같은 스킴이 통과하면 그 자체가 XSS 가 된다.
 * 문자열 검사가 아니라 `new URL()` 로 파싱해 프로토콜을 본다.
 * (`java\nscript:` 처럼 공백·개행을 섞어 넣는 우회를 문자열 비교로는 막기 어렵다)
 *
 * 빈 값은 정상이다. 링크가 없는 저서·기사도 등록할 수 있어야 하고,
 * 그때 화면은 링크를 아예 그리지 않는다.
 */
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

const externalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) =>
    value === undefined || value.length === 0 ? null : value,
  )
  .refine((value) => {
    if (value === null) return true;
    try {
      return HTTP_PROTOCOLS.has(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "http:// 또는 https:// 로 시작하는 주소만 입력할 수 있습니다.");

/**
 * 발행일 · 게시일.
 *
 * `<input type="date">` 가 보내는 `YYYY-MM-DD` 만 받는다.
 * **정오(UTC)로 만들어 `@db.Date` 에 넣는다.** 자정으로 만들면 드라이버·DB 의
 * 시간대 해석이 한 시간만 어긋나도 날짜가 하루 밀린다.
 *
 * 값이 없는 것은 정상이다. 발행연도만 아는 자료를 억지로 날짜로 만들지 않는다.
 */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value === undefined || value.length === 0 ? null : value,
  )
  .refine(
    (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "날짜 형식이 올바르지 않습니다.",
  )
  .transform((value) => (value === null ? null : new Date(`${value}T12:00:00Z`)))
  .refine(
    (value) => value === null || !Number.isNaN(value.getTime()),
    "실제로 없는 날짜입니다.",
  );

/**
 * ISBN.
 *
 * 숫자와 하이픈, 그리고 ISBN-10 의 마지막 자리에만 쓰이는 `X` 를 허용한다.
 * 체크디지트까지 검산하지는 않는다. **원본에 적힌 값을 그대로 옮겨 적는 칸**이고,
 * 계산이 맞지 않는다고 저장을 막으면 원본을 그대로 둘 수 없게 된다.
 */
const optionalIsbn = z
  .string()
  .trim()
  .max(20)
  .optional()
  .transform((value) =>
    value === undefined || value.length === 0 ? null : value,
  )
  .refine(
    (value) => value === null || /^[0-9Xx-]+$/.test(value),
    "ISBN 은 숫자와 하이픈만 입력할 수 있습니다.",
  );

/**
 * 주요 저서.
 *
 * 한국어 제목만 필수다. 나머지는 원본에서 확인되지 않을 수 있어 전부 선택 입력이다.
 * 소개는 **우리가 직접 쓴 짧은 글**이 들어가는 칸이라 긴 텍스트 한도를 그대로 쓴다.
 * (서점 상품설명을 통째로 옮겨 넣는 용도가 아니다 — CLAUDE.md 22항)
 */
export const facultyBookSchema = z.object({
  titleKo: requiredShort,
  titleEn: optionalShort,
  subtitleKo: optionalShort,
  subtitleEn: optionalShort,
  authorKo: optionalShort,
  authorEn: optionalShort,
  publisherKo: optionalShort,
  publisherEn: optionalShort,
  publishedAt: optionalDate,
  isbn: optionalIsbn,
  descriptionKo: optionalLong,
  descriptionEn: optionalLong,
  externalUrl,
  coverMediaId: mediaRef,
  sortOrder,
  isPublished: checkbox,
});

export type FacultyBookInput = z.infer<typeof facultyBookSchema>;

/**
 * 언론 · 미디어.
 *
 * 기사 본문을 담는 칸은 없다. `summary` 는 우리가 쓴 1~2문장 소개다.
 */
export const facultyArticleSchema = z.object({
  titleKo: requiredShort,
  titleEn: optionalShort,
  summaryKo: optionalLong,
  summaryEn: optionalLong,
  publisherKo: optionalShort,
  publisherEn: optionalShort,
  publishedAt: optionalDate,
  externalUrl,
  imageMediaId: mediaRef,
  sortOrder,
  isPublished: checkbox,
});

export type FacultyArticleInput = z.infer<typeof facultyArticleSchema>;

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

/**
 * 검증 실패 안내 한 줄.
 *
 * **우리가 직접 쓴 안내문(`refine` 의 메시지)이 있을 때만 그것을 보여 준다.**
 * zod 가 스스로 만드는 문구는 영어인 데다 (`Too big: expected string…`)
 * 관리자에게는 무슨 칸이 문제인지 알려 주지도 못한다. 그런 경우는 일반 안내로 돌린다.
 *
 * 링크 형식·ISBN·날짜처럼 **무엇이 잘못됐는지 알아야 고칠 수 있는** 칸이 생겨
 * 15단계에서 만들었다.
 */
export function firstIssueMessage(error: z.ZodError): string {
  const custom = error.issues.find((issue) => issue.code === "custom");
  return custom?.message ?? CMS_INVALID_ERROR;
}

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
  mediaId: mediaRef,
  documentMediaId: mediaRef,
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
  mediaId: mediaRef,
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
// 학교소식 (학교소식 지시 4·7·8항)
// ---------------------------------------------------------------------------

export const newsCategories = [
  "NOTICE",
  "EVENT",
  "ACADEMIC",
  "MEDIA",
  "OTHER",
] as const;

/**
 * 상세 URL slug.
 *
 * 비워 두면 액션이 한국어 제목에서 자동 생성한다. 직접 입력하는 경우
 * 문자(한글 포함)·숫자와 하이픈만 허용한다. `href` 세그먼트에 들어가는 값이라
 * 공백·슬래시·특수문자가 섞이면 링크가 깨진다.
 */
const newsSlug = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((value) =>
    value === undefined || value.length === 0 ? null : value,
  )
  .refine(
    (value) =>
      value === null || /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(value),
    "슬러그는 문자·숫자와 하이픈(-)만 사용할 수 있습니다.",
  );

/**
 * 게시일. 필수다.
 *
 * `<input type="date">` 가 보내는 `YYYY-MM-DD` 만 받는다. `@db.Date` 컬럼이라
 * **정오(UTC)로 만든다.** 자정으로 만들면 시간대 해석에 따라 하루가 밀린다.
 * (`FacultyBook.publishedAt` 의 `optionalDate` 와 같은 규칙이며 여기서는 필수)
 */
const requiredNewsDate = z
  .string()
  .trim()
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
    "게시일을 선택해 주세요.",
  )
  .transform((value) => new Date(`${value}T12:00:00Z`))
  .refine(
    (value) => !Number.isNaN(value.getTime()),
    "실제로 없는 날짜입니다.",
  );

/**
 * 학교소식.
 *
 * 한국어 제목·본문만 필수다. 영문이 비면 영문 페이지에서 한국어를 그대로 보여준다.
 * 본문은 rich text 가 아니라 여러 문단의 평문이며, 화면에서 HTML 로 해석하지 않는다.
 * 첨부파일(`attachmentMediaIds`)은 개수가 가변이라 이 스키마가 아니라
 * 액션에서 `formData.getAll` 로 따로 처리한다.
 */
export const newsSchema = z.object({
  slug: newsSlug,
  titleKo: requiredShort,
  titleEn: optionalShort,
  summaryKo: optionalLong,
  summaryEn: optionalLong,
  contentKo: z.string().trim().min(1).max(LONG),
  contentEn: optionalLong,
  category: z.enum(newsCategories),
  publishedAt: requiredNewsDate,
  coverMediaId: mediaRef,
  isPublished: checkbox,
});

export type NewsInput = z.infer<typeof newsSchema>;

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

// ---------------------------------------------------------------------------
// 미디어 (11단계)
// ---------------------------------------------------------------------------

/**
 * 대체 텍스트.
 *
 * **필수가 아니다.** 장식용 이미지에는 빈 alt 가 오히려 올바르고,
 * PDF 처럼 alt 개념이 없는 파일도 같은 칸을 쓴다.
 * 대신 관리자 화면에서 이미지일 때 입력을 권한다.
 *
 * 파일 자체는 이 스키마로 다루지 않는다. 업로드 검증은 `lib/media/validation.ts` 가 한다.
 */
export const mediaAltSchema = z.object({
  altKo: optionalLong,
  altEn: optionalLong,
});

export type MediaAltInput = z.infer<typeof mediaAltSchema>;
