"use server";

import type { ProgramType } from "@/generated/prisma/enums";
import { isLocale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import {
  assertEncryptionKeyConfigured,
  encryptResidentNumber,
} from "@/lib/admission/crypto";
import {
  admissionDocumentList,
  type AdmissionDocumentKey,
} from "@/lib/admission/documents";
import {
  isUniqueViolation,
  nextApplicationNo,
} from "@/lib/admission/receipt";
import {
  admissionRelativePath,
  createStoredName,
  removeAdmissionDirectory,
  saveAdmissionFile,
} from "@/lib/admission/storage";
import {
  admissionErrorCodes,
  admissionUploadSlots,
  firstStepWithError,
  MAX_TOTAL_UPLOAD_BYTES,
  type AdmissionErrorCode,
  type AdmissionExtension,
  type AdmissionFieldErrors,
} from "@/lib/admission/form-config";
import {
  admissionSchemaFields,
  createAdmissionSchema,
  parseCareerRows,
  parseEducationRows,
  parseSignatureDataUrl,
  prepareUpload,
  type AdmissionInput,
} from "@/lib/admission/validation";
import { MIN_FILL_MS, spamGuardFields, toFieldErrors } from "@/lib/validation/inquiry";
import {
  getAdmissionFeeForReceipt,
  type AdmissionFeeReceipt,
} from "@/lib/cms/admission-fee";
import type { AdmissionFileType } from "@/generated/prisma/enums";

/**
 * 온라인 입학신청 제출. (18단계)
 *
 * 기존 상담 폼과 같은 이유로 Route Handler 가 아니라 **Server Action** 을 쓴다.
 * 공개 API 를 늘리지 않고, Next.js 가 Origin 을 검증해 주며, 폼과 타입을 공유한다.
 *
 * ## 이 액션의 성격
 *
 * **임시저장이 없다.** 지원자는 한 번에 작성하고 한 번에 제출하며,
 * 이 함수 한 번의 호출로 신청서 · 학력 · 경력 · 서명 3개 · 첨부파일이 모두 저장된다.
 * 그래서 "일부만 저장된 신청서" 가 남지 않도록 순서를 신경 써야 한다. (아래 참고)
 *
 * ## 주민등록번호
 *
 * 평문은 이 파일 안에서만 존재하고 **`encryptResidentNumber()` 를 거친 뒤에야 Prisma 로 간다.**
 * 반환값(`AdmissionFormState`)에도, 로그에도 들어가지 않는다.
 * 실패 로그는 오류 객체만 남기고 폼 데이터는 절대 찍지 않는다.
 */

// ---------------------------------------------------------------------------
// 폼 상태
// ---------------------------------------------------------------------------

export type AdmissionFormState =
  | { status: "idle" }
  | {
      status: "success";
      applicationNo: string;
      program: ProgramType;
      name: string;
      /**
       * 최종 제출 성공 시점의 입학허가비·납부계좌. (입학허가비 안내 지시 10·11·19항)
       * 관리자가 납부 안내를 껐으면 `null` → 완료 화면이 계좌 영역을 그리지 않는다.
       * DB 저장·파일 저장이 모두 성공한 뒤에만 이 값을 읽어 담는다.
       */
      feeInfo: AdmissionFeeReceipt | null;
    }
  /** 오류가 있는 첫 STEP 번호를 함께 돌려준다. 폼이 그 단계로 되돌아간다. */
  | { status: "invalid"; fieldErrors: AdmissionFieldErrors; step: number }
  | { status: "error"; reason: "server" | "totalTooLarge" };

// ---------------------------------------------------------------------------
// 입력 읽기
// ---------------------------------------------------------------------------

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value : ""));
}

/** 스팸 판정. 상담 폼과 같은 장치를 그대로 쓴다. 판정은 서버에서만 한다. */
function isLikelySpam(formData: FormData): boolean {
  if (readText(formData, spamGuardFields.honeypot).trim().length > 0) {
    return true;
  }

  const loadedAt = Number(readText(formData, spamGuardFields.loadedAt));
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) return false;

  return Date.now() - loadedAt < MIN_FILL_MS;
}

/**
 * 접수번호에 쓸 연도.
 *
 * 접수 시각 기준이며 **한국 시간으로 판단한다.** 서버·DB 가 UTC 라서
 * 그대로 두면 한국 시간 1월 1일 오전에 접수된 신청서가 지난해 번호를 받는다.
 */
function receiptYear(now: Date): number {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  return new Date(now.getTime() + KST_OFFSET_MS).getUTCFullYear();
}

// ---------------------------------------------------------------------------
// 저장할 파일 한 덩이
// ---------------------------------------------------------------------------

type PendingFile = {
  type: AdmissionFileType;
  originalName: string;
  mimeType: string;
  extension: AdmissionExtension;
  bytes: Uint8Array;
};

// ---------------------------------------------------------------------------

export async function submitAdmissionApplication(
  locale: string,
  _prevState: AdmissionFormState,
  formData: FormData,
): Promise<AdmissionFormState> {
  // locale 은 URL 에서 넘어오지만 클라이언트를 거치므로 서버에서 다시 확인한다.
  if (!isLocale(locale)) return { status: "error", reason: "server" };

  // 봇에게는 실패를 알리지 않되, 저장도 하지 않는다.
  // 상담 폼과 달리 성공 화면에 접수번호가 필요하므로 조용히 오류로 돌린다.
  if (isLikelySpam(formData)) return { status: "error", reason: "server" };

  // 파일을 다 읽고 나서 키 문제로 실패하는 일이 없도록 가장 먼저 확인한다.
  try {
    assertEncryptionKeyConfigured();
  } catch (error) {
    console.error("[admission] 암호화 키 설정 오류", error);
    return { status: "error", reason: "server" };
  }

  const fieldErrors: AdmissionFieldErrors = {};

  // --- 기본정보 · 자기소개 · 개인정보 동의 ---------------------------------

  const parsed = createAdmissionSchema().safeParse({
    program: readText(formData, "program"),
    admissionYear: readText(formData, "admissionYear"),
    admissionTerm: readText(formData, "admissionTerm"),
    nameKo: readText(formData, "nameKo"),
    nameEn: readText(formData, "nameEn"),
    residentNumber: readText(formData, "residentNumber"),
    birthDate: readText(formData, "birthDate"),
    gender: readText(formData, "gender"),
    nationality: readText(formData, "nationality"),
    birthplace: readText(formData, "birthplace"),
    addressKo: readText(formData, "addressKo"),
    addressEn: readText(formData, "addressEn"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
    usCitizen: readText(formData, "usCitizen"),
    maritalStatus: readText(formData, "maritalStatus"),
    driversLicenseNumber: readText(formData, "driversLicenseNumber"),
    driversLicenseIssuedAt: readText(formData, "driversLicenseIssuedAt"),
    emergencyName: readText(formData, "emergencyName"),
    emergencyRelationship: readText(formData, "emergencyRelationship"),
    emergencyPhone: readText(formData, "emergencyPhone"),
    emergencyAddress: readText(formData, "emergencyAddress"),
    personalIntroduction: readText(formData, "personalIntroduction"),
    motivation: readText(formData, "motivation"),
    studyPlan: readText(formData, "studyPlan"),
    privacyAgreed: formData.get("privacyAgreed") === "on",
  });

  if (!parsed.success) {
    Object.assign(
      fieldErrors,
      toFieldErrors(parsed.error, admissionSchemaFields, admissionErrorCodes),
    );
  }

  // --- 학력 · 경력 ---------------------------------------------------------

  const educations = parseEducationRows(
    readList(formData, "educationSchoolName"),
    readList(formData, "educationSchoolAddress"),
    readList(formData, "educationPeriod"),
    readList(formData, "educationDegreeName"),
  );

  if (educations.length === 0) {
    fieldErrors.educations = "educationRequired";
  }

  const careers = parseCareerRows(
    readList(formData, "careerOrganization"),
    readList(formData, "careerPeriod"),
    readList(formData, "careerPosition"),
  );

  // --- 확인서 3종: 동의 + 이름 + 서명 --------------------------------------

  const signedAt = new Date();
  const signatures: PendingFile[] = [];
  const documentValues: Record<
    AdmissionDocumentKey,
    { agreed: boolean; signedName: string | null }
  > = {
    institutionalPurpose: { agreed: false, signedName: null },
    codeOfConduct: { agreed: false, signedName: null },
    statementOfFaith: { agreed: false, signedName: null },
  };

  for (const document of admissionDocumentList) {
    const agreed = formData.get(`agreed_${document.key}`) === "on";
    const signedName = readText(formData, `signedName_${document.key}`)
      .trim()
      .slice(0, 60);
    const signature = parseSignatureDataUrl(
      readText(formData, `signature_${document.key}`),
    );

    // 하나라도 빠지면 그 문서 칸에 오류를 붙인다. 어느 문서인지 화면에서 바로 보인다.
    let code: AdmissionErrorCode | undefined;
    if (!agreed) code = "agreementRequired";
    else if (signedName.length === 0) code = "required";
    else if (!signature) code = "signatureRequired";

    if (code) {
      fieldErrors[document.key] = code;
      continue;
    }

    documentValues[document.key] = { agreed: true, signedName };
    signatures.push({
      type: document.signatureFileType,
      // 서명은 지원자가 고른 파일이 아니라 우리가 만든 이미지다.
      originalName: `${document.key}-signature.png`,
      mimeType: "image/png",
      extension: "png",
      bytes: signature as Uint8Array,
    });
  }

  // --- 첨부파일 ------------------------------------------------------------

  const uploads: PendingFile[] = [];
  let totalBytes = 0;

  for (const slot of admissionUploadSlots) {
    const value = formData.get(`file_${slot.field}`);

    if (!(value instanceof File) || value.size === 0) {
      if (slot.required) fieldErrors[slot.field] = "fileRequired";
      continue;
    }

    const result = await prepareUpload(value, slot);

    if (!result.ok) {
      fieldErrors[slot.field] = result.code;
      continue;
    }

    totalBytes += result.upload.bytes.byteLength;
    uploads.push({ ...result.upload, type: slot.type });
  }

  // 요청 본문 한도 안쪽이라 여기까지 도달했지만, 정책상의 합계 상한은 따로 본다.
  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return { status: "error", reason: "totalTooLarge" };
  }

  if (Object.keys(fieldErrors).length > 0 || !parsed.success) {
    return {
      status: "invalid",
      fieldErrors,
      step: firstStepWithError(fieldErrors),
    };
  }

  // parsed.success 를 위에서 확인했으므로 여기서는 값이 있다.
  const input = parsed.data;

  // --- 저장 ----------------------------------------------------------------
  //
  // 파일시스템에는 트랜잭션이 없다. 기존 미디어 업로드와 같은 방식으로 순서로 방어한다.
  //
  //   1. 신청서 행을 먼저 만든다 (학력·경력까지 한 트랜잭션)
  //   2. 파일을 그 신청서 id 디렉터리에 쓴다
  //   3. 파일 메타 행을 만든다
  //   4. 2·3 중 어디서든 실패하면 **디렉터리와 신청서 행을 모두 되돌린다**
  //
  // 이렇게 하면 "서류 없는 신청서" 가 남지 않는다. 지원자에게는 실패로 보이고
  // 다시 제출하면 된다. 반대로 파일만 남는 경우는 4번의 정리까지 실패할 때뿐이고,
  // 그 파일은 참조하는 행이 없어 화면에 나오지 않는다.

  const year = receiptYear(signedAt);
  const pending = [...uploads, ...signatures];

  let created: { id: string; applicationNo: string; program: ProgramType };

  try {
    created = await createApplication({
      year,
      locale,
      input,
      educations,
      careers,
      documentValues,
      signedAt,
    });
  } catch (error) {
    // 폼 데이터를 로그에 남기지 않는다. 주민등록번호가 섞일 수 있는 유일한 경로다.
    console.error("[admission] 신청서 저장 실패", error);
    return { status: "error", reason: "server" };
  }

  try {
    const rows = [];

    for (const file of pending) {
      const storedName = createStoredName(file.extension);
      await saveAdmissionFile(created.id, storedName, file.bytes);

      rows.push({
        applicationId: created.id,
        type: file.type,
        originalName: file.originalName,
        storedName,
        mimeType: file.mimeType,
        size: file.bytes.byteLength,
        path: admissionRelativePath(created.id, storedName),
      });
    }

    await prisma.admissionFile.createMany({ data: rows });
  } catch (error) {
    console.error(
      `[admission] 파일 저장 실패 — 신청서를 되돌립니다 (id=${created.id})`,
      error,
    );

    await rollback(created.id);
    return { status: "error", reason: "server" };
  }

  // 여기까지 왔으면 신청서 · 학력 · 경력 · 서명 · 첨부파일이 모두 저장됐다.
  // 그때만 완료 화면에 계좌정보를 실어 보낸다. (지시 10·11항)
  // getAdmissionFeeForReceipt 는 로그를 남기지 않는다. (지시 21항)
  const feeInfo = await getAdmissionFeeForReceipt();

  return {
    status: "success",
    applicationNo: created.applicationNo,
    program: created.program,
    name: input.nameKo,
    feeInfo,
  };
}

// ---------------------------------------------------------------------------

type CreateInput = {
  year: number;
  locale: string;
  input: AdmissionInput;
  educations: ReturnType<typeof parseEducationRows>;
  careers: ReturnType<typeof parseCareerRows>;
  documentValues: Record<
    AdmissionDocumentKey,
    { agreed: boolean; signedName: string | null }
  >;
  signedAt: Date;
};

/**
 * 신청서 행을 만든다. 접수번호가 겹치면 다시 시도한다.
 *
 * 접수번호는 "마지막 번호 읽기 → +1 → insert" 라서 같은 순간에 두 건이 들어오면
 * 뒤에 넣는 쪽이 unique 위반을 맞는다. 그때는 번호를 다시 읽어 재시도한다.
 * (배경은 `src/lib/admission/receipt.ts` 주석 참고)
 */
async function createApplication({
  year,
  locale,
  input,
  educations,
  careers,
  documentValues,
  signedAt,
}: CreateInput) {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const applicationNo = await nextApplicationNo(tx, year);

        return tx.admissionApplication.create({
          data: {
            applicationNo,
            program: input.program,
            admissionYear: input.admissionYear,
            admissionTerm: input.admissionTerm,

            nameKo: input.nameKo,
            nameEn: input.nameEn,
            // 평문은 여기서 끝난다. 이 줄 뒤로는 암호문만 존재한다.
            residentNumberEncrypted: encryptResidentNumber(input.residentNumber),
            birthDate: input.birthDate,
            gender: input.gender,
            nationality: input.nationality,
            birthplace: input.birthplace,

            addressKo: input.addressKo,
            addressEn: input.addressEn,
            phone: input.phone,
            email: input.email,
            usCitizen: input.usCitizen,

            maritalStatus: input.maritalStatus,
            driversLicenseNumber: input.driversLicenseNumber,
            driversLicenseIssuedAt: input.driversLicenseIssuedAt,

            emergencyName: input.emergencyName,
            emergencyRelationship: input.emergencyRelationship,
            emergencyPhone: input.emergencyPhone,
            emergencyAddress: input.emergencyAddress,

            personalIntroduction: input.personalIntroduction,
            motivation: input.motivation,
            studyPlan: input.studyPlan,

            institutionalPurposeAgreed:
              documentValues.institutionalPurpose.agreed,
            institutionalPurposeSignedName:
              documentValues.institutionalPurpose.signedName,
            institutionalPurposeSignedAt: signedAt,

            codeOfConductAgreed: documentValues.codeOfConduct.agreed,
            codeOfConductSignedName: documentValues.codeOfConduct.signedName,
            codeOfConductSignedAt: signedAt,

            statementOfFaithAgreed: documentValues.statementOfFaith.agreed,
            statementOfFaithSignedName:
              documentValues.statementOfFaith.signedName,
            statementOfFaithSignedAt: signedAt,

            privacyAgreed: true,
            locale,
            submittedAt: signedAt,

            // status 는 DB 기본값 NEW 를 쓴다.
            // adminMemo · applicationNo 는 사용자 입력에서 받지 않는다.
            educations: {
              create: educations.map((row, index) => ({
                schoolName: row.schoolName,
                schoolAddress: row.schoolAddress,
                period: row.period,
                degreeName: row.degreeName,
                sortOrder: index,
              })),
            },
            careers: {
              create: careers.map((row, index) => ({
                organization: row.organization,
                period: row.period,
                position: row.position,
                sortOrder: index,
              })),
            },
          },
          select: { id: true, applicationNo: true, program: true },
        });
      });
    } catch (error) {
      if (isUniqueViolation(error) && attempt < MAX_ATTEMPTS) continue;
      throw error;
    }
  }

  throw new Error("접수번호를 만들지 못했습니다.");
}

/**
 * 파일 저장이 실패했을 때 신청서를 되돌린다.
 *
 * 되돌리기 자체가 실패해도 사용자에게는 이미 실패를 알린 뒤이므로 로그만 남긴다.
 * 신청서 행이 지워지면 `AdmissionFile` 은 `onDelete: Cascade` 로 함께 사라진다.
 */
async function rollback(applicationId: string): Promise<void> {
  try {
    await removeAdmissionDirectory(applicationId);
  } catch (error) {
    console.error(
      `[admission] 파일 디렉터리 정리 실패 (id=${applicationId})`,
      error,
    );
  }

  try {
    await prisma.admissionApplication.delete({ where: { id: applicationId } });
  } catch (error) {
    console.error(
      `[admission] 신청서 되돌리기 실패 (id=${applicationId})`,
      error,
    );
  }
}
