import { z } from "zod";
import { detectType } from "@/lib/media/validation";
import { normalizeResidentNumber } from "./crypto";
import {
  admissionTermValues,
  admissionYearRange,
  genderValues,
  maritalStatusValues,
  MAX_CAREER_ROWS,
  MAX_EDUCATION_ROWS,
  MAX_SIGNATURE_BYTES,
  MAX_UPLOAD_BYTES,
  programValues,
  usCitizenValues,
  type AdmissionErrorCode,
  type AdmissionExtension,
  type AdmissionField,
  type UploadSlot,
} from "./form-config";

/**
 * 온라인 입학신청의 **서버 측** 검증. (18단계)
 *
 * 기존 상담 폼(`src/lib/validation/inquiry.ts`)과 같은 원칙을 따른다.
 *  - 클라이언트 검증은 편의 기능이고 **저장 여부는 여기서만 결정한다.**
 *  - 스키마에는 문구가 아니라 **오류 코드**만 넣는다. 문구는 `src/content/admission` 에서 찾는다.
 *  - 저장 대상은 여기 나열된 필드뿐이다. `status`·`adminMemo`·`applicationNo` 는
 *    클라이언트가 보내더라도 걸러진다. (allowlist)
 *
 * ⚠️ 이 파일은 `crypto.ts`(→ `node:crypto`)를 불러오므로 **서버에서만** 쓸 수 있다.
 * 폼과 나눠 쓰는 상수는 `form-config.ts` 에 있다.
 */

// ---------------------------------------------------------------------------
// 길이 제한
// ---------------------------------------------------------------------------

const MAX_NAME = 60;
const MAX_EMAIL = 160;
const MAX_PHONE = 30;
const MAX_SHORT = 120;
const MAX_ADDRESS = 300;
const MAX_STATEMENT = 4000;
const MIN_STATEMENT = 10;

// ---------------------------------------------------------------------------
// 공통 필드 규칙
// ---------------------------------------------------------------------------

/**
 * 국내·국제번호를 모두 받되 숫자와 구분기호 외의 문자는 받지 않는다.
 * 상담 폼과 같은 규칙이지만 오류 코드 체계가 달라 여기서 다시 정의한다.
 */
const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s.]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

function requiredText(max: number) {
  return z.string().trim().min(1, "required").max(max, "tooLong");
}

/** 선택 입력. 빈 문자열은 DB 에 "" 대신 null 로 저장한다. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, "tooLong")
    .transform((value) => (value.length === 0 ? null : value));
}

/** 자기소개서 3문항. 길이 하한을 두어 "." 한 글자 제출을 막는다. */
function statementText() {
  return requiredText(MAX_STATEMENT).refine(
    (value) => value.length >= MIN_STATEMENT,
    "tooShort",
  );
}

const phoneField = z
  .string()
  .trim()
  .min(1, "required")
  .max(MAX_PHONE, "invalidPhone")
  .refine((value) => PHONE_ALLOWED_CHARS.test(value), "invalidPhone")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
  }, "invalidPhone");

/**
 * 생년월일. `<input type="date">` 가 보내는 `YYYY-MM-DD` 만 받는다.
 *
 * **UTC 자정으로 만든다.** 컬럼이 `@db.Date` 라 시각 개념이 없고,
 * 지역 시간으로 만들면 시간대에 따라 하루가 밀린다.
 * (`FacultyBook.publishedAt` 과 같은 판단 — `src/lib/admin/format.ts` 주석 참고)
 */
const birthDateField = z
  .string()
  .trim()
  .min(1, "required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate")
  .transform((value) => new Date(`${value}T00:00:00.000Z`))
  .refine((date) => !Number.isNaN(date.getTime()), "invalidDate")
  .refine(
    (date) => date.getUTCFullYear() >= 1900 && date.getTime() <= Date.now(),
    "invalidDate",
  );

// ---------------------------------------------------------------------------
// 본문 스키마 (STEP 1 · 3 · 개인정보 동의)
// ---------------------------------------------------------------------------

export function createAdmissionSchema(now = new Date()) {
  const { min, max } = admissionYearRange(now);

  return z.object({
    program: z.enum(programValues, "invalidChoice"),
    admissionYear: z
      .string()
      .trim()
      .min(1, "required")
      .transform((value) => Number(value))
      .refine(
        (value) => Number.isInteger(value) && value >= min && value <= max,
        "invalidYear",
      ),
    admissionTerm: z.enum(admissionTermValues, "invalidChoice"),

    nameKo: requiredText(MAX_NAME),
    nameEn: requiredText(MAX_NAME),

    /**
     * 주민등록번호. **여기서 나오는 값은 숫자 13자리 문자열이며,
     * 저장 직전에 반드시 `encryptResidentNumber()` 를 거친다.**
     * 이 값이 로그·오류 응답에 실리지 않도록 호출하는 쪽에서 주의한다.
     */
    residentNumber: z
      .string()
      .trim()
      .min(1, "required")
      .transform((value) => normalizeResidentNumber(value))
      .refine(
        (value): value is string => value !== null,
        "invalidResidentNumber",
      ),

    birthDate: birthDateField,
    gender: z.enum(genderValues, "invalidChoice"),
    nationality: requiredText(MAX_SHORT),
    birthplace: requiredText(MAX_SHORT),

    addressKo: requiredText(MAX_ADDRESS),
    addressEn: requiredText(MAX_ADDRESS),
    phone: phoneField,
    email: z
      .string()
      .trim()
      .min(1, "required")
      .max(MAX_EMAIL, "tooLong")
      .pipe(z.email("invalidEmail")),

    /** 선택하지 않으면 빈 문자열이 오므로 required 로 잡힌다. */
    usCitizen: z
      .enum(usCitizenValues, "required")
      .transform((value) => value === "yes"),

    maritalStatus: z
      .string()
      .trim()
      .transform((value) => (value.length === 0 ? null : value))
      .refine(
        (value): value is "SINGLE" | "MARRIED" | null =>
          value === null ||
          (maritalStatusValues as readonly string[]).includes(value),
        "invalidChoice",
      ),

    driversLicenseNumber: optionalText(MAX_SHORT),
    driversLicenseIssuedAt: optionalText(MAX_SHORT),

    emergencyName: requiredText(MAX_NAME),
    emergencyRelationship: requiredText(MAX_SHORT),
    emergencyPhone: phoneField,
    emergencyAddress: requiredText(MAX_ADDRESS),

    personalIntroduction: statementText(),
    motivation: statementText(),
    studyPlan: statementText(),

    privacyAgreed: z.literal(true, "required"),
  });
}

export type AdmissionSchema = ReturnType<typeof createAdmissionSchema>;
export type AdmissionInput = z.infer<AdmissionSchema>;

/** 스키마 키가 늘거나 이름이 바뀌면 여기서 컴파일 오류가 난다. */
export const admissionSchemaFields = [
  "program",
  "admissionYear",
  "admissionTerm",
  "nameKo",
  "nameEn",
  "residentNumber",
  "birthDate",
  "gender",
  "nationality",
  "birthplace",
  "addressKo",
  "addressEn",
  "phone",
  "email",
  "usCitizen",
  "maritalStatus",
  "driversLicenseNumber",
  "driversLicenseIssuedAt",
  "emergencyName",
  "emergencyRelationship",
  "emergencyPhone",
  "emergencyAddress",
  "personalIntroduction",
  "motivation",
  "studyPlan",
  "privacyAgreed",
] as const satisfies readonly (keyof AdmissionInput & AdmissionField)[];

// ---------------------------------------------------------------------------
// 학력 · 경력
// ---------------------------------------------------------------------------

const MAX_ROW_TEXT = 200;

export type EducationRow = {
  schoolName: string;
  schoolAddress: string | null;
  period: string | null;
  degreeName: string | null;
};

export type CareerRow = {
  organization: string;
  period: string | null;
  position: string | null;
};

function cleanRowValue(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function orNull(value: string): string | null {
  return value.length === 0 ? null : value;
}

/**
 * 학력 줄을 정리한다. **학교명이 빈 줄은 통째로 버린다.**
 * 사용자가 [+ 학력 추가] 를 눌러 놓고 채우지 않은 줄이 저장되면 안 된다.
 */
export function parseEducationRows(
  schoolNames: unknown[],
  addresses: unknown[],
  periods: unknown[],
  degrees: unknown[],
): EducationRow[] {
  const rows: EducationRow[] = [];

  for (let index = 0; index < schoolNames.length; index += 1) {
    const schoolName = cleanRowValue(schoolNames[index], MAX_ROW_TEXT);
    if (schoolName.length === 0) continue;

    rows.push({
      schoolName,
      schoolAddress: orNull(cleanRowValue(addresses[index], MAX_ROW_TEXT)),
      period: orNull(cleanRowValue(periods[index], MAX_ROW_TEXT)),
      degreeName: orNull(cleanRowValue(degrees[index], MAX_ROW_TEXT)),
    });

    if (rows.length >= MAX_EDUCATION_ROWS) break;
  }

  return rows;
}

/** 경력 줄. 직장명이 빈 줄은 버린다. 경력은 0건이어도 된다. */
export function parseCareerRows(
  organizations: unknown[],
  periods: unknown[],
  positions: unknown[],
): CareerRow[] {
  const rows: CareerRow[] = [];

  for (let index = 0; index < organizations.length; index += 1) {
    const organization = cleanRowValue(organizations[index], MAX_ROW_TEXT);
    if (organization.length === 0) continue;

    rows.push({
      organization,
      period: orNull(cleanRowValue(periods[index], MAX_ROW_TEXT)),
      position: orNull(cleanRowValue(positions[index], MAX_ROW_TEXT)),
    });

    if (rows.length >= MAX_CAREER_ROWS) break;
  }

  return rows;
}

// ---------------------------------------------------------------------------
// 첨부파일
// ---------------------------------------------------------------------------

export type PreparedUpload = {
  originalName: string;
  mimeType: string;
  extension: AdmissionExtension;
  bytes: Uint8Array;
};

/**
 * 업로드 파일 하나를 검증하고 저장 가능한 형태로 바꾼다.
 *
 * **확장자와 브라우저가 알려준 MIME 을 믿지 않는다.** 기존 미디어 업로드와 같은 이유로
 * 파일 앞부분의 signature 로 실제 형식을 판정하고 저장 확장자도 그 결과에서 만든다.
 * (`src/lib/media/validation.ts` 의 `detectType` 을 그대로 재사용한다)
 *
 * 크기를 내용보다 먼저 본다. 큰 파일을 메모리로 다 읽은 뒤 거절하면
 * 큰 파일을 계속 보내는 것만으로 서버를 흔들 수 있다.
 */
export async function prepareUpload(
  file: File,
  slot: UploadSlot,
): Promise<
  { ok: true; upload: PreparedUpload } | { ok: false; code: AdmissionErrorCode }
> {
  if (file.size === 0) {
    return { ok: false, code: slot.required ? "fileRequired" : "fileType" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, code: "fileTooLarge" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectType(bytes);

  // detectType 은 WebP 도 알아보지만 입학서류에서는 받지 않는다. (지시 18항)
  if (
    !detected ||
    !(slot.accept as readonly string[]).includes(detected.extension)
  ) {
    return { ok: false, code: "fileType" };
  }

  return {
    ok: true,
    upload: {
      originalName: file.name.slice(0, 255),
      mimeType: detected.mimeType,
      extension: detected.extension as AdmissionExtension,
      bytes,
    },
  };
}

// ---------------------------------------------------------------------------
// 전자서명
// ---------------------------------------------------------------------------

const SIGNATURE_DATA_URL_PREFIX = "data:image/png;base64,";

/**
 * 서명 canvas 가 보낸 data URL 을 PNG 바이트로 바꾼다.
 *
 * 브라우저가 `canvas.toDataURL("image/png")` 로 만든 값만 받는다.
 * 접두사만 보고 믿지 않고 **디코딩한 뒤 magic byte 로 PNG 인지 다시 확인한다.**
 * 사용자가 임의의 문자열을 밀어 넣어도 여기서 걸린다.
 */
export function parseSignatureDataUrl(value: string): Uint8Array | null {
  if (!value.startsWith(SIGNATURE_DATA_URL_PREFIX)) return null;

  const base64 = value.slice(SIGNATURE_DATA_URL_PREFIX.length);
  if (base64.length === 0) return null;

  const bytes = new Uint8Array(Buffer.from(base64, "base64"));
  if (bytes.length === 0 || bytes.length > MAX_SIGNATURE_BYTES) return null;

  const detected = detectType(bytes);
  if (!detected || detected.extension !== "png") return null;

  return bytes;
}
