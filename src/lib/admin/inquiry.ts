import type { InquiryStatus, ProgramType } from "@/generated/prisma/enums";
import { locales, type Locale } from "@/i18n/config";

/**
 * 입학상담 · 설명회 신청 관리 화면이 함께 쓰는 규칙.
 *
 * 두 화면은 목록 → 상세 → 상태변경이라는 흐름이 같지만 다루는 내용은 다르다.
 * 그래서 **공통인 것만** 여기 둔다: 상태 라벨, 쿼리 파라미터 해석, 페이지네이션 계산.
 * 실제 조회(Prisma where 절)와 표에 보여줄 항목은 각 화면이 직접 작성한다.
 * 범용 repository 를 만들지 않는다. (CLAUDE.md 21항 - 과도한 추상화 금지)
 */

// ---------------------------------------------------------------------------
// 상태
// ---------------------------------------------------------------------------

export const inquiryStatuses = ["NEW", "IN_PROGRESS", "COMPLETED"] as const;

/**
 * 상태 표시 문구.
 *
 * enum 은 두 모델이 공유하지만 **표시 문구는 도메인에 맞춘다.**
 *  - 입학상담의 IN_PROGRESS 는 "상담중" (CLAUDE.md 12항이 이 표현을 지정한다)
 *  - 설명회 신청은 상담이 아니므로 "진행중"
 * 각 화면 안에서는 한 벌만 쓰이므로 헷갈리지 않는다.
 */
export const consultationStatusLabels: Record<InquiryStatus, string> = {
  NEW: "신규",
  IN_PROGRESS: "상담중",
  COMPLETED: "완료",
};

export const seminarStatusLabels: Record<InquiryStatus, string> = {
  NEW: "신규",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
};

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (inquiryStatuses as readonly string[]).includes(value);
}

export const programTypes = ["MBA", "DBA"] as const;

export function isProgramType(value: string): value is ProgramType {
  return (programTypes as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// 목록 쿼리 파라미터
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 100;

/** Next.js 가 넘겨주는 searchParams 값의 원형. 같은 키가 여러 번 오면 배열이 된다. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export type InquiryListQuery = {
  /** undefined 면 전체 */
  status?: InquiryStatus;
  program?: ProgramType;
  locale?: Locale;
  /** 공백 제거·길이 제한을 마친 검색어. 비어 있으면 undefined */
  q?: string;
  page: number;
  pageSize: number;
};

function firstValue(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value : undefined;
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
  max: number,
): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

/**
 * URL 쿼리를 목록 조회 조건으로 바꾼다.
 *
 * **알 수 없는 값은 오류로 만들지 않고 조용히 무시한다.** (예: ?status=HACK → 전체)
 * 관리자가 주소창을 잘못 건드렸다고 화면이 깨지면 곤란하다.
 */
export function parseInquiryListQuery(
  raw: RawSearchParams,
): InquiryListQuery {
  const status = firstValue(raw.status);
  const program = firstValue(raw.program);
  const localeValue = firstValue(raw.locale);
  const q = firstValue(raw.q)?.trim().slice(0, MAX_SEARCH_LENGTH);

  return {
    status: status && isInquiryStatus(status) ? status : undefined,
    program: program && isProgramType(program) ? program : undefined,
    locale:
      localeValue && (locales as readonly string[]).includes(localeValue)
        ? (localeValue as Locale)
        : undefined,
    q: q ? q : undefined,
    page: parsePositiveInt(firstValue(raw.page), 1, Number.MAX_SAFE_INTEGER),
    pageSize: parsePositiveInt(
      firstValue(raw.pageSize),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
  };
}

/**
 * LIKE 패턴에서 특수한 의미를 갖는 문자를 문자 그대로 찾도록 이스케이프한다.
 *
 * Prisma 의 `contains` 는 SQL 의 LIKE 로 번역되는데, **와일드카드를 이스케이프해 주지 않는다.**
 * 그래서 검색창에 `%` 를 넣으면 `LIKE '%%%'` 가 되어 전체가 매칭된다.
 * 파라미터 바인딩은 되고 있어 SQL Injection 은 아니지만, 검색 결과가 엉뚱해진다.
 *
 * PostgreSQL 의 LIKE 는 기본 이스케이프 문자가 백슬래시이므로 `\` 를 앞에 붙인다.
 * 백슬래시 자신도 이스케이프해야 하므로 먼저 처리되도록 문자 클래스에 함께 넣는다.
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * 이름·이메일·연락처를 부분 일치로 찾는 Prisma 조건.
 *
 * 문자열 SQL 을 직접 만들지 않는다. Prisma 가 파라미터 바인딩을 하므로
 * 검색어에 따옴표가 들어가도 안전하다. (CLAUDE.md 18항)
 */
export function buildSearchFilter(q: string | undefined) {
  if (!q) return undefined;

  const pattern = escapeLikePattern(q);

  return {
    OR: [
      { name: { contains: pattern, mode: "insensitive" as const } },
      { email: { contains: pattern, mode: "insensitive" as const } },
      { phone: { contains: pattern, mode: "insensitive" as const } },
    ],
  };
}

// ---------------------------------------------------------------------------
// 페이지네이션
// ---------------------------------------------------------------------------

export type PaginationInfo = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  skip: number;
  hasPrevious: boolean;
  hasNext: boolean;
  /** 현재 화면에 보이는 구간. 0건이면 둘 다 0 */
  firstIndex: number;
  lastIndex: number;
};

/**
 * 페이지 정보를 계산한다.
 *
 * 요청한 page 가 마지막 페이지를 넘어가면 마지막 페이지로 당겨준다.
 * (필터를 바꿔 결과가 줄었을 때 빈 화면이 나오지 않게 하기 위함)
 */
export function getPagination(
  page: number,
  pageSize: number,
  totalCount: number,
): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;

  return {
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
    skip,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
    firstIndex: totalCount === 0 ? 0 : skip + 1,
    lastIndex: Math.min(skip + pageSize, totalCount),
  };
}

/** 현재 필터를 유지한 채 일부 값만 바꾼 링크를 만든다. */
export function buildListHref(
  basePath: string,
  current: InquiryListQuery,
  overrides: Partial<Record<"status" | "program" | "locale" | "q" | "page", string | undefined>>,
): string {
  const params = new URLSearchParams();

  const merged: Record<string, string | undefined> = {
    status: current.status,
    program: current.program,
    locale: current.locale,
    q: current.q,
    page: current.page > 1 ? String(current.page) : undefined,
    ...overrides,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }

  // pageSize 는 기본값과 다를 때만 유지한다.
  if (current.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(current.pageSize));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
