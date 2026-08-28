import { prisma } from "@/lib/prisma";

/**
 * 관리자 화면이 입학신청 한 건을 읽는 곳. (18단계)
 *
 * 상세 화면과 인쇄 화면이 **같은 항목을 필요로 한다.** 두 곳에서 각각 `select` 를 적으면
 * 한쪽에 컬럼을 추가할 때 다른 쪽이 조용히 빠진다. 그래서 조회를 한 곳에 둔다.
 *
 * ⚠️ `residentNumberEncrypted` 는 **암호문 그대로** 나온다.
 * 화면에서 그대로 쓰지 말고 `maskEncryptedResidentNumber()`(상세) 또는
 * `decryptResidentNumber()`(인쇄) 를 거친다.
 */
export async function findAdmissionApplication(id: string) {
  return prisma.admissionApplication.findUnique({
    where: { id },
    select: {
      id: true,
      applicationNo: true,
      status: true,

      program: true,
      admissionYear: true,
      admissionTerm: true,

      nameKo: true,
      nameEn: true,
      residentNumberEncrypted: true,
      birthDate: true,
      gender: true,
      nationality: true,
      birthplace: true,

      addressKo: true,
      addressEn: true,
      phone: true,
      email: true,
      usCitizen: true,

      maritalStatus: true,
      driversLicenseNumber: true,
      driversLicenseIssuedAt: true,

      emergencyName: true,
      emergencyRelationship: true,
      emergencyPhone: true,
      emergencyAddress: true,

      personalIntroduction: true,
      motivation: true,
      studyPlan: true,

      institutionalPurposeAgreed: true,
      institutionalPurposeSignedName: true,
      institutionalPurposeSignedAt: true,
      codeOfConductAgreed: true,
      codeOfConductSignedName: true,
      codeOfConductSignedAt: true,
      statementOfFaithAgreed: true,
      statementOfFaithSignedName: true,
      statementOfFaithSignedAt: true,

      privacyAgreed: true,
      locale: true,
      adminMemo: true,
      submittedAt: true,
      updatedAt: true,

      educations: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          id: true,
          schoolName: true,
          schoolAddress: true,
          period: true,
          degreeName: true,
        },
      },
      careers: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          id: true,
          organization: true,
          period: true,
          position: true,
        },
      },
      files: {
        orderBy: { createdAt: "asc" as const },
        select: {
          id: true,
          type: true,
          originalName: true,
          mimeType: true,
          size: true,
          path: true,
        },
      },
    },
  });
}

export type AdmissionApplicationDetail = NonNullable<
  Awaited<ReturnType<typeof findAdmissionApplication>>
>;
