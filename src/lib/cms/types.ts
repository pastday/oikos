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
  /**
   * 교수 소개. 빈 줄로 나뉜 문단이며 없으면 빈 배열이다.
   * 학력·경력과 달리 줄글이라 목록이 아니라 문단으로 그린다.
   */
  bio: string[];
  /** 학력. **한 줄이 한 항목**이다. 없으면 빈 배열 */
  education: string[];
  /** 주요 경력. 한 줄이 한 항목 */
  career: string[];
  /** 전문분야. 한 줄이 한 항목. DB 필드명만 과거 이름인 `lectureFields` 다. */
  lectureFields: string[];
  /** 교수 사진. 없으면 null 이고 화면은 이니셜 아바타를 그린다. */
  photo: MediaView | null;
  /** 이니셜 아바타용. 사진이 없을 때 쓴다. */
  initials: string;
  /** 주요 저서. 공개된 것만, 표시순서대로. 없으면 빈 배열 (15단계) */
  books: FacultyBookView[];
  /** 언론 · 미디어 보도. 공개된 것만, 표시순서대로. 없으면 빈 배열 (15단계) */
  articles: FacultyArticleView[];
};

/** 상세 프로필이 하나라도 있는지. 없으면 화면이 상세 영역을 통째로 생략한다. */
export function hasFacultyProfile(member: FacultyView): boolean {
  return (
    member.bio.length > 0 ||
    member.education.length > 0 ||
    member.career.length > 0 ||
    member.lectureFields.length > 0 ||
    member.books.length > 0 ||
    member.articles.length > 0
  );
}

// ---------------------------------------------------------------------------
// 교수 저서 · 언론보도 (15단계)
// ---------------------------------------------------------------------------

/**
 * 주요 저서 한 권.
 *
 * 화면이 Ko/En 을 고르지 않도록 **이미 정리된 값**만 담는다.
 * `meta` 는 저자 · 출판사 · 발행연도를 가운뎃점으로 이어 붙인 한 줄이다.
 * 세 값 중 있는 것만 들어가며, 하나도 없으면 null 이다.
 */
export type FacultyBookView = {
  id: string;
  title: string;
  subtitle: string | null;
  /** 저자 · 출판사 · 발행연도를 이어 붙인 한 줄. 없으면 null */
  meta: string | null;
  description: string | null;
  /** 검증을 통과한 http(s) 주소. 없으면 화면이 링크를 그리지 않는다. */
  url: string | null;
  /** 사용권이 확인된 표지만 연결된다. 없으면 화면이 글자 표지를 그린다. */
  cover: MediaView | null;
};

/**
 * 언론 · 미디어 한 건.
 *
 * **기사 본문은 담지 않는다.** `summary` 는 우리가 쓴 짧은 소개다. (CLAUDE.md 22항)
 * `meta` 는 게시처와 게시일을 이어 붙인 한 줄이다.
 */
export type FacultyArticleView = {
  id: string;
  title: string;
  summary: string | null;
  /** 게시처 · 게시일. 없으면 null */
  meta: string | null;
  url: string | null;
  image: MediaView | null;
};

/**
 * 발행일 · 게시일 표시.
 *
 * DB 는 `date` 라 시각이 없다. **`timeZone: "UTC"` 를 고정한다.**
 * 서버 시간대에 따라 해석하면 자정 근처 값이 하루 밀려 보인다.
 */
const dateFormatters: Record<Locale, Intl.DateTimeFormat> = {
  ko: new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

export function formatPublishedDate(
  locale: Locale,
  value: Date | null,
): string | null {
  if (!value) return null;
  return dateFormatters[locale].format(value);
}

/** 발행연도만. 저서 한 줄 정보에는 날짜까지 적으면 길어진다. */
export function formatPublishedYear(value: Date | null): string | null {
  if (!value) return null;
  return String(value.getUTCFullYear());
}

/** 있는 값만 가운뎃점으로 잇는다. 하나도 없으면 null. */
export function joinMeta(parts: (string | null)[]): string | null {
  const kept = parts.filter((part): part is string => Boolean(part?.trim()));
  return kept.length > 0 ? kept.join(" · ") : null;
}

/**
 * 화면에 내보내기 전 외부 링크를 **한 번 더** 확인한다.
 *
 * 관리자 화면으로 들어온 값은 `validation.ts` 가 이미 걸렀다. 그래도 여기서 다시 보는 이유는
 * DB 행이 CMS 를 거치지 않고 들어올 수 있기 때문이다. (이관 스크립트, psql)
 * `href` 에 그대로 들어가는 값이라 한 번 새면 곧바로 XSS 가 된다.
 * 통과하지 못한 값은 링크를 그리지 않는다. 잘못된 주소로 보내는 것보다 낫다.
 */
export function toSafeUrl(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    // `url.href` 를 돌려주지 않는다. 그건 정규화된 주소라 원본과 달라질 수 있다.
    // (경로 없는 주소에 `/` 가 붙는 등) 앞뒤 공백만 떼고 입력값을 그대로 쓴다.
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

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

// ---------------------------------------------------------------------------
// 페이지 콘텐츠 (10단계)
// ---------------------------------------------------------------------------

/** 섹션 안의 반복 항목. locale 하나로 이미 정리된 값만 담는다. */
export type PageItemView = {
  id: string;
  label: string | null;
  value: string | null;
  variant: string | null;
  /** 항목 이미지. 없으면 null 이고 화면은 이미지 없이 그린다. */
  media: MediaView | null;
};

/**
 * 공개 화면이 쓰는 섹션.
 *
 * 모든 슬롯이 `string | null` 이다. 원본 자료에 없는 값을 만들지 않기 위해
 * 비어 있는 상태를 정상으로 취급하며, **화면은 값이 없으면 그 부분을 그리지 않는다.**
 * (10단계 원칙 5 — 일부 필드가 비어도 페이지가 깨지지 않아야 한다)
 */
export type PageSectionView = {
  title: string | null;
  subtitle: string | null;
  /** 빈 줄로 나뉜 문단. 본문이 없으면 빈 배열이다. */
  paragraphs: string[];
  highlight: string | null;
  note: string | null;
  /** 섹션 대표 이미지. 없으면 null */
  media: MediaView | null;
  /** 섹션에 딸린 문서(PDF). 없으면 null 이고 링크를 그리지 않는다. */
  document: MediaView | null;
  items: PageItemView[];
};

/** `sectionKey` → 섹션. 카탈로그에 있어도 DB 에 행이 없으면 키 자체가 없다. */
export type PageSectionMap = Record<string, PageSectionView | undefined>;

/**
 * 본문 문단을 나눈다.
 *
 * **빈 줄(연속 줄바꿈)이 문단 구분자다.** 한 번의 줄바꿈은 문단 안의 줄바꿈이 아니라
 * 같은 문단으로 이어 붙인다. 관리자가 편집기 폭 때문에 무심코 넣은 줄바꿈이
 * 화면에서 문단으로 갈라지는 것을 막기 위해서다.
 */
export function toParagraphs(body: string | null): string[] {
  if (!body) return [];

  return body
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter((block) => block.length > 0);
}

/**
 * 목록 입력을 항목 배열로 나눈다. **한 줄이 한 항목**이다.
 *
 * 학력·경력·전문분야처럼 관리자가 textarea 에 줄 단위로 적는 값에 쓴다.
 * 문단 글(`toParagraphs`)과 규칙이 다른 이유는, 이런 값은 줄바꿈 하나하나가
 * 곧 항목 구분이기 때문이다. 빈 줄은 버리고 앞뒤 공백은 지운다.
 * 관리자가 줄 앞에 붙여 넣은 `- ` `• ` 같은 글머리표도 함께 지운다.
 * 화면이 자기 글머리표를 그리므로 그대로 두면 두 번 찍힌다.
 */
export function toLines(value: string | null): string[] {
  if (!value) return [];

  return value
    .split("\n")
    .map((line) => line.trim().replace(/^[-*\u2022\u00b7]\s+/, "").trim())
    .filter((line) => line.length > 0);
}

// ---------------------------------------------------------------------------

export type FaqView = {
  id: string;
  question: string;
  answer: string;
};

// ---------------------------------------------------------------------------

/**
 * 입학안내 수치.
 *
 * 값이 없을 수 있다. 원본 자료에 금액이 없는 항목(LMS 사용료)이 실제로 있고,
 * 관리자가 아직 입력하지 않은 상태도 정상이다. 화면에서 "-" 로 표시한다.
 */
export type AdmissionNumbers = Record<string, number | null>;

// ---------------------------------------------------------------------------
// 미디어 (12단계)
// ---------------------------------------------------------------------------

/**
 * 공개 화면이 쓰는 파일.
 *
 * DB 행을 그대로 넘기지 않고 **locale 하나로 정리된 값**만 담는다.
 * 화면 컴포넌트가 어느 언어의 대체 텍스트를 골라야 하는지 몰라도 되게 한다.
 */
export type MediaView = {
  url: string;
  /** 현재 locale 기준 대체 텍스트. 없으면 빈 문자열(장식용으로 취급) */
  alt: string;
  originalName: string;
  /** 문서 링크에 크기를 표시할 때 쓴다 */
  size: number;
};

type MediaRow = {
  path: string;
  altKo: string | null;
  altEn: string | null;
  originalName: string;
  size: number;
};

/**
 * 대체 텍스트는 **현재 언어를 먼저 보고, 없으면 반대 언어를 쓴다.**
 *
 * 둘 다 없으면 빈 문자열이다. 없는 설명을 지어내지 않으며,
 * 빈 alt 는 "장식용 이미지" 라는 뜻으로 화면 읽기 프로그램이 건너뛴다.
 * 이미지가 전달하는 정보가 옆 글에 이미 있는 경우가 많아 이 편이 더 정확하다.
 */
export function toMediaView(
  locale: Locale,
  row: MediaRow | null | undefined,
): MediaView | null {
  if (!row) return null;

  const primary = locale === "ko" ? row.altKo : row.altEn;
  const secondary = locale === "ko" ? row.altEn : row.altKo;
  const alt = primary?.trim() || secondary?.trim() || "";

  return {
    url: row.path,
    alt,
    originalName: row.originalName,
    size: row.size,
  };
}
