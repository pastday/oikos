import type { AdmissionErrorCode } from "@/lib/admission/form-config";

/**
 * 온라인 입학신청 폼의 **문구** 타입. (18단계)
 *
 * 기존 상세 페이지 콘텐츠(`src/content/pages`)와 같은 방식이다.
 * 한국어와 영어가 **같은 타입을 공유**하므로 한쪽에 키가 늘면 다른 쪽에서 컴파일 오류가 난다.
 * 문구를 컴포넌트에 직접 적지 않는 이 프로젝트의 원칙을 그대로 따른다.
 *
 * 확인서 3종의 **본문**은 여기 없다. 원본이 영문뿐이라 번역본을 만들지 않으며
 * `src/lib/admission/documents.ts` 에 한 벌만 둔다.
 */

export type FieldText = {
  label: string;
  placeholder?: string;
  hint?: string;
};

export type ChoiceText = { label: string; options: Record<string, string> };

export type AdmissionContent = {
  intro: {
    eyebrow: string;
    title: string;
    description: string;
  };

  /** 폼 시작 전 안내. 임시저장이 없다는 사실을 여기서 분명히 알린다. (지시 20항) */
  notices: {
    noDraft: string;
    documentLanguage: string;
    privacyPending: string;
  };

  /** 학사학위가 없는 지원자를 상담으로 보내는 안내. (지시 27항) */
  eligibility: {
    title: string;
    body: string;
    cta: string;
  };

  common: {
    requiredMark: string;
    optionalMark: string;
    selectPlaceholder: string;
    previous: string;
    next: string;
    submit: string;
    submitting: string;
    stepLabel: (current: number, total: number) => string;
  };

  steps: readonly string[];

  step1: {
    title: string;
    description: string;
    programSection: string;
    personalSection: string;
    emergencySection: string;
    otherSection: string;
    program: ChoiceText;
    admissionYear: FieldText;
    admissionTerm: ChoiceText;
    nameKo: FieldText;
    nameEn: FieldText;
    residentNumber: FieldText;
    birthDate: FieldText;
    gender: ChoiceText;
    nationality: FieldText;
    birthplace: FieldText;
    addressKo: FieldText;
    addressEn: FieldText;
    phone: FieldText;
    email: FieldText;
    usCitizen: ChoiceText;
    maritalStatus: ChoiceText;
    driversLicenseNumber: FieldText;
    driversLicenseIssuedAt: FieldText;
    emergencyName: FieldText;
    emergencyRelationship: FieldText;
    emergencyPhone: FieldText;
    emergencyAddress: FieldText;
  };

  step2: {
    title: string;
    description: string;
    educationTitle: string;
    educationHint: string;
    careerTitle: string;
    careerHint: string;
    addEducation: string;
    addCareer: string;
    removeRow: string;
    rowLabel: (index: number) => string;
    schoolName: FieldText;
    schoolAddress: FieldText;
    period: FieldText;
    degreeName: FieldText;
    organization: FieldText;
    careerPeriod: FieldText;
    position: FieldText;
  };

  step3: {
    title: string;
    description: string;
    personalIntroduction: FieldText;
    motivation: FieldText;
    studyPlan: FieldText;
  };

  step4: {
    title: string;
    description: string;
    agreeLabel: string;
    signedNameLabel: string;
    signedNamePlaceholder: string;
    signatureLabel: string;
    signatureHint: string;
    signatureClear: string;
    signatureEmpty: string;
    signatureDone: string;
    dateNotice: string;
  };

  step5: {
    title: string;
    description: string;
    requiredTitle: string;
    optionalTitle: string;
    fileHint: string;
    totalLimitHint: string;
    chooseFile: string;
    files: {
      graduationCertificate: FieldText;
      transcript: FieldText;
      passport: FieldText;
      photo: FieldText;
      insurance: FieldText;
      phoneBill: FieldText;
      electricBill: FieldText;
      rentBill: FieldText;
      recommendation: FieldText;
    };
    privacyLabel: string;
    privacySummary: string;
  };

  alerts: {
    invalid: string;
    server: string;
    totalTooLarge: string;
  };

  errors: Record<AdmissionErrorCode, string>;

  success: {
    title: string;
    description: string;
    applicationNoLabel: string;
    programLabel: string;
    nameLabel: string;
    note: string;
    links: { path: string; label: string }[];
  };
};
