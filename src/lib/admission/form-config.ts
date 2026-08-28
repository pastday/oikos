import type { AdmissionFileType } from "@/generated/prisma/enums";

/**
 * 입학신청 폼의 **순수 상수**. (18단계)
 *
 * ## 왜 검증 코드와 파일을 나누는가
 *
 * `validation.ts` 는 `node:crypto` 를 쓰는 `crypto.ts` 를 불러오므로 **서버 전용**이다.
 * 그런데 폼(클라이언트 컴포넌트)도 업로드 칸 목록·용량 한도·STEP 매핑이 필요하다.
 * 같은 파일에 두면 Node 전용 모듈이 브라우저 번들로 딸려 들어가 빌드가 깨진다.
 *
 * 그래서 **양쪽이 함께 보는 값만** 여기 둔다. 이 파일은 순수 상수와 순수 함수뿐이다.
 * (`src/lib/media/` 를 `url.ts` 와 `storage.ts` 로 나눈 것과 같은 이유다)
 */

// ---------------------------------------------------------------------------
// 오류 코드 · 필드
// ---------------------------------------------------------------------------

export const admissionErrorCodes = [
  "required",
  "tooLong",
  "tooShort",
  "invalidEmail",
  "invalidPhone",
  "invalidResidentNumber",
  "invalidDate",
  "invalidYear",
  "invalidChoice",
  "educationRequired",
  "agreementRequired",
  "signatureRequired",
  "fileRequired",
  "fileTooLarge",
  "fileType",
] as const;

export type AdmissionErrorCode = (typeof admissionErrorCodes)[number];

export const admissionFields = [
  // STEP 1 — 기본정보
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
  // STEP 2 — 학력 · 경력
  "educations",
  "careers",
  // STEP 3 — 자기소개
  "personalIntroduction",
  "motivation",
  "studyPlan",
  // STEP 4 — 확인서 · 서명
  "institutionalPurpose",
  "codeOfConduct",
  "statementOfFaith",
  // STEP 5 — 서류 · 제출
  "graduationCertificate",
  "transcript",
  "passport",
  "photo",
  "insurance",
  "phoneBill",
  "electricBill",
  "rentBill",
  "recommendation",
  "privacyAgreed",
] as const;

export type AdmissionField = (typeof admissionFields)[number];

export type AdmissionFieldErrors = Partial<
  Record<AdmissionField, AdmissionErrorCode>
>;

/** 폼 전체 단계 수. 화면과 검증이 같은 값을 본다. */
export const ADMISSION_STEP_COUNT = 5;

/**
 * 필드가 몇 번째 STEP 에 있는지.
 *
 * 서버가 오류를 돌려줬을 때 폼이 **오류가 있는 첫 STEP 으로 되돌아가기** 위해 쓴다.
 * 이것이 없으면 사용자는 5단계에서 "입력을 확인해 주세요" 만 보고 어디가 틀렸는지 알 수 없다.
 */
export const admissionFieldStep: Record<AdmissionField, number> = {
  program: 1,
  admissionYear: 1,
  admissionTerm: 1,
  nameKo: 1,
  nameEn: 1,
  residentNumber: 1,
  birthDate: 1,
  gender: 1,
  nationality: 1,
  birthplace: 1,
  addressKo: 1,
  addressEn: 1,
  phone: 1,
  email: 1,
  usCitizen: 1,
  maritalStatus: 1,
  driversLicenseNumber: 1,
  driversLicenseIssuedAt: 1,
  emergencyName: 1,
  emergencyRelationship: 1,
  emergencyPhone: 1,
  emergencyAddress: 1,
  educations: 2,
  careers: 2,
  personalIntroduction: 3,
  motivation: 3,
  studyPlan: 3,
  institutionalPurpose: 4,
  codeOfConduct: 4,
  statementOfFaith: 4,
  graduationCertificate: 5,
  transcript: 5,
  passport: 5,
  photo: 5,
  insurance: 5,
  phoneBill: 5,
  electricBill: 5,
  rentBill: 5,
  recommendation: 5,
  privacyAgreed: 5,
};

/** 오류가 있는 필드들 중 가장 앞선 STEP. 없으면 1. */
export function firstStepWithError(errors: AdmissionFieldErrors): number {
  const steps = (Object.keys(errors) as AdmissionField[]).map(
    (field) => admissionFieldStep[field],
  );
  return steps.length === 0 ? 1 : Math.min(...steps);
}

// ---------------------------------------------------------------------------
// 선택 값
// ---------------------------------------------------------------------------

export const programValues = ["MBA", "DBA"] as const;
export const admissionTermValues = ["SPRING", "FALL"] as const;
export const genderValues = ["MALE", "FEMALE"] as const;
export const maritalStatusValues = ["SINGLE", "MARRIED"] as const;
export const usCitizenValues = ["yes", "no"] as const;

/** 지원 가능한 입학연도 범위. 지난 학기 접수와 사전 접수를 모두 허용하는 폭이다. */
export function admissionYearRange(now = new Date()): {
  min: number;
  max: number;
} {
  const year = now.getUTCFullYear();
  return { min: year - 1, max: year + 3 };
}

// ---------------------------------------------------------------------------
// 학력 · 경력 줄 수
// ---------------------------------------------------------------------------

export const MAX_EDUCATION_ROWS = 10;
export const MAX_CAREER_ROWS = 10;

// ---------------------------------------------------------------------------
// 첨부파일
// ---------------------------------------------------------------------------

/** 저장 가능한 확장자. 실제 형식은 magic byte 로 판정하며 이 값은 그 결과에서 나온다. */
export type AdmissionExtension = "jpg" | "png" | "pdf";

/** 파일 하나의 최대 크기. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * 한 번에 올릴 수 있는 **모든 파일의 합계**.
 *
 * Server Action 요청 본문 한도(`next.config.ts` 의 21MB)와 nginx 의 24MB 안에
 * 들어가야 한다. 이 값을 넘으면 우리 검증에 닿기 전에 요청이 끊겨
 * 사용자에게 원인을 알려줄 수 없다. 그래서 **폼에서도 같은 값으로 미리 막는다.**
 */
export const MAX_TOTAL_UPLOAD_BYTES = 18 * 1024 * 1024;

/** 서명 PNG 하나의 최대 크기. 손글씨 한 줄이라 이 정도면 충분하다. */
export const MAX_SIGNATURE_BYTES = 1024 * 1024;

export type UploadSlotField = Extract<
  AdmissionField,
  | "graduationCertificate"
  | "transcript"
  | "passport"
  | "photo"
  | "insurance"
  | "phoneBill"
  | "electricBill"
  | "rentBill"
  | "recommendation"
>;

export type UploadSlot = {
  /** 폼 input name 이자 오류 필드 이름 */
  field: UploadSlotField;
  type: AdmissionFileType;
  required: boolean;
  /** 이 칸이 허용하는 형식. 증명사진은 이미지만 받는다. (지시 18항) */
  accept: readonly AdmissionExtension[];
};

const DOCUMENT_EXTENSIONS = ["pdf", "jpg", "png"] as const;
const IMAGE_EXTENSIONS = ["jpg", "png"] as const;

/**
 * 업로드 칸 정의. **화면 · 검증 · 저장이 이 배열 하나를 함께 본다.**
 * 순서는 원본 `6.Required Documents_Overseas 한글-2.hwp` 와 지시 15항을 따른다.
 */
export const admissionUploadSlots: readonly UploadSlot[] = [
  {
    field: "graduationCertificate",
    type: "GRADUATION_CERTIFICATE",
    required: true,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "transcript",
    type: "TRANSCRIPT",
    required: true,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "passport",
    type: "PASSPORT",
    required: true,
    accept: DOCUMENT_EXTENSIONS,
  },
  { field: "photo", type: "PHOTO", required: true, accept: IMAGE_EXTENSIONS },
  {
    field: "insurance",
    type: "INSURANCE",
    required: false,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "phoneBill",
    type: "PHONE_BILL",
    required: false,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "electricBill",
    type: "ELECTRIC_BILL",
    required: false,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "rentBill",
    type: "RENT_BILL",
    required: false,
    accept: DOCUMENT_EXTENSIONS,
  },
  {
    field: "recommendation",
    type: "RECOMMENDATION",
    required: false,
    accept: DOCUMENT_EXTENSIONS,
  },
];

const MIME_BY_EXTENSION: Record<AdmissionExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

/** 브라우저 파일 선택기에 넘길 accept 값. 편의 장치이며 판정은 서버가 한다. */
export function acceptAttribute(slot: UploadSlot): string {
  return slot.accept
    .map((extension) => MIME_BY_EXTENSION[extension])
    .join(",");
}

/** 용량 표시. 기존 미디어 화면과 같은 형식을 쓴다. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
