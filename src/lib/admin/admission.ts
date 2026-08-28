import type {
  AdmissionFileType,
  AdmissionGender,
  AdmissionMaritalStatus,
  AdmissionStatus,
  AdmissionTerm,
  ProgramType,
} from "@/generated/prisma/enums";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/admin/inquiry";

/**
 * 관리자 입학신청 화면이 쓰는 규칙. (18단계)
 *
 * 상담 관리(`src/lib/admin/inquiry.ts`)와 목록 → 상세 → 상태변경 흐름은 같지만
 * **상태 enum 과 검색 대상 컬럼이 다르다.** 그래서 그 파일의 쿼리 파서를 그대로 쓰지 못한다.
 * 대신 페이지 계산(`getPagination`)처럼 진짜로 같은 것만 가져다 쓰고,
 * 여기서는 입학신청에만 있는 것을 정의한다. 범용 목록 프레임워크를 만들지 않는다.
 */

// ---------------------------------------------------------------------------
// 표시 문구
// ---------------------------------------------------------------------------

export const admissionStatuses = [
  "NEW",
  "IN_REVIEW",
  "COMPLETED",
] as const satisfies readonly AdmissionStatus[];

export const admissionStatusLabels: Record<AdmissionStatus, string> = {
  NEW: "신규",
  IN_REVIEW: "확인중",
  COMPLETED: "완료",
};

export const admissionTermLabels: Record<AdmissionTerm, string> = {
  SPRING: "봄학기 (Spring)",
  FALL: "가을학기 (Fall)",
};

export const admissionGenderLabels: Record<AdmissionGender, string> = {
  MALE: "남",
  FEMALE: "여",
};

export const admissionMaritalStatusLabels: Record<
  AdmissionMaritalStatus,
  string
> = {
  SINGLE: "미혼",
  MARRIED: "기혼",
};

/** 첨부파일 종류 표시 문구. 관리자 상세·인쇄 화면이 함께 쓴다. */
export const admissionFileTypeLabels: Record<AdmissionFileType, string> = {
  GRADUATION_CERTIFICATE: "졸업증명서",
  TRANSCRIPT: "성적증명서",
  PASSPORT: "여권사본",
  PHOTO: "증명사진",
  INSURANCE: "Student Insurance Certificate",
  PHONE_BILL: "Phone Bill",
  ELECTRIC_BILL: "Electric Bill",
  RENT_BILL: "Rent Bill",
  RECOMMENDATION: "추천서",
  SIGNATURE_INSTITUTIONAL_PURPOSE: "서명 · Statement of Institutional Purpose",
  SIGNATURE_CODE_OF_CONDUCT: "서명 · Student Code of Conduct",
  SIGNATURE_STATEMENT_OF_FAITH: "서명 · Statement of Faith",
  GENERATED_PDF: "생성된 PDF",
};

/** 서명 파일인지. 상세 화면에서 첨부서류 목록과 서명을 나눠 보여주기 위해 쓴다. */
export function isSignatureFileType(type: AdmissionFileType): boolean {
  return type.startsWith("SIGNATURE_");
}

export function isAdmissionStatus(value: string): value is AdmissionStatus {
  return (admissionStatuses as readonly string[]).includes(value);
}

const programTypes = ["MBA", "DBA"] as const satisfies readonly ProgramType[];

function isProgramType(value: string): value is ProgramType {
  return (programTypes as readonly string[]).includes(value);
}

export { programTypes as admissionProgramTypes };

// ---------------------------------------------------------------------------
// 목록 쿼리
// ---------------------------------------------------------------------------

const MAX_SEARCH_LENGTH = 100;

export type AdmissionListQuery = {
  status?: AdmissionStatus;
  program?: ProgramType;
  /** 공백 제거·길이 제한을 마친 검색어. 비어 있으면 undefined */
  q?: string;
  page: number;
  pageSize: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

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

/** 알 수 없는 값은 오류로 만들지 않고 조용히 무시한다. (상담 목록과 같은 방침) */
export function parseAdmissionListQuery(
  raw: RawSearchParams,
): AdmissionListQuery {
  const status = firstValue(raw.status);
  const program = firstValue(raw.program);
  const q = firstValue(raw.q)?.trim().slice(0, MAX_SEARCH_LENGTH);

  return {
    status: status && isAdmissionStatus(status) ? status : undefined,
    program: program && isProgramType(program) ? program : undefined,
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
 * (배경은 `src/lib/admin/inquiry.ts` 의 같은 함수 주석 참고)
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * 검색 조건. **이름과 접수번호만 찾는다.** (지시 24항)
 *
 * ⚠️ `residentNumberEncrypted` 는 검색 대상이 아니다.
 * 애초에 암호문이라 부분 일치가 성립하지 않고, 검색 인덱스에 넣을 이유도 없다.
 */
export function buildAdmissionSearchFilter(q: string | undefined) {
  if (!q) return undefined;

  const pattern = escapeLikePattern(q);

  return {
    OR: [
      { nameKo: { contains: pattern, mode: "insensitive" as const } },
      { nameEn: { contains: pattern, mode: "insensitive" as const } },
      { applicationNo: { contains: pattern, mode: "insensitive" as const } },
    ],
  };
}

/** 현재 필터를 유지한 채 일부 값만 바꾼 링크를 만든다. */
export function buildAdmissionListHref(
  basePath: string,
  current: AdmissionListQuery,
  overrides: Partial<
    Record<"status" | "program" | "q" | "page", string | undefined>
  >,
): string {
  const params = new URLSearchParams();

  const merged: Record<string, string | undefined> = {
    status: current.status,
    program: current.program,
    q: current.q,
    page: current.page > 1 ? String(current.page) : undefined,
    ...overrides,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }

  if (current.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(current.pageSize));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
