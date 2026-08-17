import { z } from "zod";

/**
 * 입학상담 · 설명회 신청 폼의 서버 측 검증 규칙.
 *
 * 설계 원칙
 *  - 클라이언트 검증은 편의 기능일 뿐이고, **저장 여부는 여기서만 결정한다.** (CLAUDE.md 18항)
 *  - 오류 메시지 문구를 스키마에 넣지 않고 **오류 코드**만 넣는다.
 *    문구는 locale 별 콘텐츠(`src/content/pages`)에서 코드로 찾아 표시한다.
 *    이렇게 해야 서버 액션이 언어에 의존하지 않고, 한/영 문구 누락이 컴파일 단계에서 드러난다.
 *  - 저장 대상 필드는 스키마에 나열된 것뿐이다. status·adminMemo 처럼 관리자만 다루는 값은
 *    클라이언트가 보내더라도 여기서 걸러진다. (allowlist)
 */

// ---------------------------------------------------------------------------
// 스팸 방어용 숨김 필드
// ---------------------------------------------------------------------------

/**
 * 폼과 서버 액션이 같은 이름을 쓰도록 한곳에 둔다.
 *
 * - honeypot: 봇만 채우는 숨김 입력. 값이 있으면 자동 제출로 본다.
 * - loadedAt: 폼이 브라우저에 뜬 시각. 사람이 채우기 어려운 속도면 자동 제출로 본다.
 *
 * 둘 다 클라이언트가 보내는 값이라 위조할 수 있다. 확정적인 차단이 아니라 최소한의 마찰이며,
 * CAPTCHA·rate limit 은 운영 배포 단계에서 검토한다. (CLAUDE.md 10항)
 */
export const spamGuardFields = {
  honeypot: "company",
  loadedAt: "loadedAt",
} as const;

/** 폼이 뜬 뒤 이 시간 안에 들어온 제출은 사람이 작성한 것으로 보지 않는다. */
export const MIN_FILL_MS = 2_500;

// ---------------------------------------------------------------------------
// 오류 코드
// ---------------------------------------------------------------------------

/** 두 폼이 공통으로 쓰는 오류 코드 */
const sharedErrorCodes = [
  "nameRequired",
  "nameTooLong",
  "phoneRequired",
  "phoneInvalid",
  "emailRequired",
  "emailInvalid",
  "emailTooLong",
  "privacyRequired",
] as const;

export const consultationErrorCodes = [
  ...sharedErrorCodes,
  "programRequired",
  "messageRequired",
  "messageTooShort",
  "messageTooLong",
] as const;

export const seminarErrorCodes = [
  ...sharedErrorCodes,
  "sessionTooLong",
  "attendeeCountInvalid",
  "memoTooLong",
] as const;

export type ConsultationErrorCode = (typeof consultationErrorCodes)[number];
export type SeminarErrorCode = (typeof seminarErrorCodes)[number];

// ---------------------------------------------------------------------------
// 공통 필드 규칙
// ---------------------------------------------------------------------------

/** 이름·연락처 등 짧은 입력의 최대 길이. DB 는 text 지만 비정상적으로 긴 값을 받지 않는다. */
const MAX_NAME = 60;
const MAX_EMAIL = 160;
const MAX_PHONE = 30;

/** 국내·국제번호를 모두 받되 숫자와 구분기호 외의 문자는 받지 않는다. */
const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s.]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

const nameField = z
  .string()
  .trim()
  .min(1, "nameRequired")
  .max(MAX_NAME, "nameTooLong");

const phoneField = z
  .string()
  .trim()
  .min(1, "phoneRequired")
  .max(MAX_PHONE, "phoneInvalid")
  .refine((value) => PHONE_ALLOWED_CHARS.test(value), "phoneInvalid")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
  }, "phoneInvalid");

const emailField = z
  .string()
  .trim()
  .min(1, "emailRequired")
  .max(MAX_EMAIL, "emailTooLong")
  .pipe(z.email("emailInvalid"));

/** 체크박스는 반드시 체크되어야 한다. (CLAUDE.md 11항) */
const privacyField = z.literal(true, "privacyRequired");

/** 선택 입력. 빈 문자열은 DB 에 "" 대신 null 로 저장한다. */
function optionalText<Code extends string>(maxLength: number, tooLong: Code) {
  return z
    .string()
    .trim()
    .max(maxLength, tooLong)
    .transform((value) => (value.length === 0 ? null : value));
}

// ---------------------------------------------------------------------------
// 입학상담
// ---------------------------------------------------------------------------

const MIN_MESSAGE = 5;
const MAX_MESSAGE = 2000;

/** 현재 제공하는 과정은 MBA / DBA 두 가지뿐이다. (docs/decisions.md 2항) */
export const interestedProgramValues = ["MBA", "DBA"] as const;

export const consultationSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  interestedProgram: z.enum(interestedProgramValues, "programRequired"),
  message: z
    .string()
    .trim()
    .min(1, "messageRequired")
    .min(MIN_MESSAGE, "messageTooShort")
    .max(MAX_MESSAGE, "messageTooLong"),
  privacyAgreed: privacyField,
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
export type ConsultationField = keyof ConsultationInput;

/** 오류를 표시할 수 있는 필드 목록. 스키마에서 키가 늘면 여기서 컴파일 오류가 난다. */
export const consultationFields = [
  "name",
  "phone",
  "email",
  "interestedProgram",
  "message",
  "privacyAgreed",
] as const satisfies readonly ConsultationField[];

// ---------------------------------------------------------------------------
// 설명회 신청
// ---------------------------------------------------------------------------

/**
 * 참석 인원 범위.
 * 원본 자료에 정원 규정이 없어 상식적인 상한만 둔다. 확정되면 조정한다. (docs/decisions.md 6단계)
 */
export const MIN_ATTENDEES = 1;
export const MAX_ATTENDEES = 10;

const MAX_SESSION = 200;
const MAX_MEMO = 2000;

export const seminarSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  /** 확정된 설명회 일정이 아직 없어 자유 입력(선택)으로 둔다. 없는 일정을 만들지 않는다. */
  preferredSession: optionalText(MAX_SESSION, "sessionTooLong"),
  attendeeCount: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine(
      (value) =>
        Number.isInteger(value) &&
        value >= MIN_ATTENDEES &&
        value <= MAX_ATTENDEES,
      "attendeeCountInvalid",
    ),
  memo: optionalText(MAX_MEMO, "memoTooLong"),
  privacyAgreed: privacyField,
});

export type SeminarInput = z.infer<typeof seminarSchema>;
export type SeminarField = keyof SeminarInput;

export const seminarFields = [
  "name",
  "phone",
  "email",
  "preferredSession",
  "attendeeCount",
  "memo",
  "privacyAgreed",
] as const satisfies readonly SeminarField[];

// ---------------------------------------------------------------------------
// 오류 변환
// ---------------------------------------------------------------------------

/**
 * ZodError 를 `{ 필드명: 오류코드 }` 형태로 바꾼다.
 * 한 필드에 오류가 여러 개면 첫 번째만 쓴다. 사용자에게 한 줄만 보여주기 위함이다.
 *
 * 메시지가 정해진 오류 코드 목록에 없으면(예: 예상 못 한 zod 기본 메시지) 무시한다.
 * 캐스팅으로 억지로 통과시키지 않는다.
 */
export function toFieldErrors<Field extends string, Code extends string>(
  error: z.ZodError,
  allowedFields: readonly Field[],
  allowedCodes: readonly Code[],
): Partial<Record<Field, Code>> {
  const fields = new Set<string>(allowedFields);
  const codes = new Set<string>(allowedCodes);

  const isField = (value: PropertyKey): value is Field =>
    typeof value === "string" && fields.has(value);
  const isCode = (value: string): value is Code => codes.has(value);

  const result: Partial<Record<Field, Code>> = {};

  for (const issue of error.issues) {
    const [field] = issue.path;
    if (field === undefined) continue;
    if (!isField(field) || field in result) continue;
    if (!isCode(issue.message)) continue;

    result[field] = issue.message;
  }

  return result;
}
