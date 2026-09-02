import type { AdmissionContent } from "./types";

/**
 * 온라인 입학신청 폼 한국어 문구.
 *
 * 항목 이름은 원본 입학원서(`docs/source/입학서류/1.Application 한글-2-2.hwp`)의
 * 칸 이름을 그대로 쓴다. 원본에 없는 칸을 만들지 않는다. (CLAUDE.md 23항)
 */
export const admissionKo: AdmissionContent = {
  intro: {
    eyebrow: "ADMISSION APPLICATION",
    title: "온라인 입학신청",
    description:
      "Oikos University 경영대학원 MBA · DBA 과정 입학을 신청합니다. 입력하신 내용은 입학원서로 접수됩니다.",
  },

  notices: {
    noDraft:
      "임시저장 기능이 없습니다. 브라우저를 닫거나 새로고침하면 작성 중인 내용이 사라집니다. 서류 파일을 먼저 준비한 뒤 한 번에 작성해 주세요.",
    documentLanguage:
      "확인서 3종은 학교가 제공한 영문 원문입니다. 공식 한국어 번역본이 없어 원문을 그대로 표시합니다.",
    privacyPending:
      "개인정보 처리방침 전문은 준비 중입니다. 수집 항목과 이용 목적은 아래 안내를 확인해 주세요.",
  },

  eligibility: {
    title: "온라인 입학신청 대상",
    body: "온라인 입학신청은 MBA · DBA 지원자를 위한 페이지입니다. 학사학위가 없거나 학위연계과정 상담이 필요한 경우 상담신청을 이용해 주세요.",
    cta: "학위연계과정 상담 신청",
  },

  common: {
    requiredMark: "필수",
    optionalMark: "선택",
    selectPlaceholder: "선택해 주세요",
    previous: "이전",
    next: "다음",
    submit: "입학신청 제출",
    submitting: "제출 중…",
    stepLabel: (current, total) => `${current} / ${total} 단계`,
  },

  steps: ["기본정보", "학력 · 경력", "자기소개", "확인서 · 서명", "서류 · 제출"],

  step1: {
    title: "기본정보",
    description: "입학원서의 인적사항 항목입니다.",
    programSection: "지원 과정",
    personalSection: "인적사항",
    emergencySection: "비상연락처",
    otherSection: "기타",

    program: {
      label: "지원 과정",
      options: { MBA: "MBA (경영학 석사)", DBA: "DBA (경영학 박사)" },
    },
    admissionYear: { label: "입학 연도" },
    admissionTerm: {
      label: "입학 학기",
      options: { SPRING: "봄학기 (Spring)", FALL: "가을학기 (Fall)" },
    },

    nameKo: { label: "이름 (한글)", placeholder: "홍길동" },
    nameEn: {
      label: "이름 (영문)",
      placeholder: "HONG GILDONG",
      hint: "여권과 동일한 표기로 입력해 주세요.",
    },
    residentNumber: {
      label: "주민등록번호",
      placeholder: "900101-1234567",
      hint: "암호화하여 저장하며, 관리자 화면에는 가려진 형태로만 표시됩니다.",
    },
    birthDate: { label: "생년월일" },
    gender: { label: "성별", options: { MALE: "남", FEMALE: "여" } },
    nationality: { label: "국적", placeholder: "대한민국" },
    birthplace: { label: "출생지", placeholder: "서울특별시" },

    addressKo: { label: "주소 (한글)", placeholder: "도로명 주소를 입력해 주세요" },
    addressEn: { label: "주소 (영문)", placeholder: "English address" },
    phone: { label: "휴대전화", placeholder: "010-0000-0000" },
    email: { label: "이메일", placeholder: "example@email.com" },
    usCitizen: {
      label: "미국 시민권 보유 여부",
      options: { yes: "예", no: "아니오" },
    },

    maritalStatus: {
      label: "혼인상태",
      options: { SINGLE: "미혼", MARRIED: "기혼" },
    },
    driversLicenseNumber: { label: "운전면허번호" },
    driversLicenseIssuedAt: { label: "운전면허 발행장소" },

    emergencyName: { label: "이름" },
    emergencyRelationship: { label: "관계", placeholder: "예: 배우자, 부, 모" },
    emergencyPhone: { label: "전화번호", placeholder: "010-0000-0000" },
    emergencyAddress: { label: "주소" },
  },

  step2: {
    title: "학력 · 경력",
    description:
      "학력은 가장 최근 졸업 학위부터 기재해 주세요. 입력하신 학력과 경력이 Resume 를 대신합니다.",
    educationTitle: "학력",
    educationHint: "최소 1건 이상 입력해 주세요.",
    careerTitle: "경력",
    careerHint: "해당 사항이 없으면 비워 두셔도 됩니다.",
    addEducation: "+ 학력 추가",
    addCareer: "+ 경력 추가",
    removeRow: "삭제",
    rowLabel: (index) => `${index}번째`,

    schoolName: { label: "학교명" },
    schoolAddress: { label: "학교 주소" },
    period: { label: "재학기간", placeholder: "예: 2015.03 ~ 2019.02" },
    degreeName: { label: "학위명", placeholder: "예: 경영학사" },

    organization: { label: "직장명" },
    careerPeriod: { label: "기간", placeholder: "예: 2019.03 ~ 재직중" },
    position: { label: "직위" },
  },

  step3: {
    title: "자기소개",
    description:
      "각 항목을 10자 이상 작성해 주세요. 작성하신 내용은 자기소개서로 접수됩니다.",
    personalIntroduction: {
      label: "자기소개",
      placeholder: "성장 과정, 성격, 강점 등을 자유롭게 작성해 주세요.",
    },
    motivation: {
      label: "지원동기",
      placeholder: "본 과정에 지원하게 된 동기를 작성해 주세요.",
    },
    studyPlan: {
      label: "학업 및 향후 계획",
      placeholder: "입학 후 학업 계획과 졸업 후 진로 계획을 작성해 주세요.",
    },
  },

  step4: {
    title: "확인서 · 서명",
    description:
      "아래 3개 문서를 각각 확인하고 서명해 주세요. 문서마다 별도의 동의와 서명이 필요합니다.",
    agreeLabel: "위 내용을 읽고 동의합니다.",
    signedNameLabel: "이름",
    signedNamePlaceholder: "이름을 입력해 주세요",
    signatureLabel: "서명",
    signatureHint:
      "아래 칸에 마우스 또는 손가락으로 서명해 주세요.",
    signatureClear: "다시 서명",
    signatureEmpty: "서명이 필요합니다.",
    signatureDone: "서명이 입력되었습니다.",
    dateNotice: "날짜는 제출 시각으로 자동 기록됩니다.",
  },

  step5: {
    title: "서류 · 제출",
    description: "필수 서류 4종을 모두 첨부해야 제출할 수 있습니다.",
    requiredTitle: "필수 제출서류",
    optionalTitle: "선택 제출서류",
    fileHint: "PDF · JPG · PNG, 파일당 최대 10MB",
    totalLimitHint: "첨부파일 전체 합계는 18MB 를 넘을 수 없습니다.",
    chooseFile: "파일 선택",

    files: {
      graduationCertificate: { label: "졸업증명서" },
      transcript: { label: "성적증명서" },
      passport: { label: "여권사본" },
      photo: { label: "증명사진 1매", hint: "JPG · PNG 이미지만 첨부할 수 있습니다." },
      insurance: { label: "Student Insurance Certificate" },
      phoneBill: { label: "Phone Bill" },
      electricBill: { label: "Electric Bill" },
      rentBill: { label: "Rent Bill" },
      recommendation: {
        label: "추천서",
        hint: "추천인이 작성한 추천서를 스캔하여 첨부해 주세요.",
      },
    },

    privacyLabel: "개인정보 수집 및 이용에 동의합니다.",
    privacySummary:
      "수집 항목: 입학원서 기재사항, 제출서류. 이용 목적: 입학 심사 및 입학 관련 안내.",
  },

  alerts: {
    invalid: "입력하신 내용을 확인해 주세요. 문제가 있는 단계로 이동합니다.",
    server: "제출하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    totalTooLarge:
      "첨부파일 전체 용량이 18MB 를 넘습니다. 파일 크기를 줄이거나 선택 서류를 빼고 제출해 주세요.",
  },

  errors: {
    required: "필수 입력 항목입니다.",
    tooLong: "입력이 너무 깁니다.",
    tooShort: "10자 이상 입력해 주세요.",
    invalidEmail: "이메일 형식을 확인해 주세요.",
    invalidPhone: "전화번호 형식을 확인해 주세요.",
    invalidResidentNumber: "주민등록번호 13자리를 정확히 입력해 주세요.",
    invalidDate: "날짜를 확인해 주세요.",
    invalidYear: "입학 연도를 확인해 주세요.",
    invalidChoice: "선택 값을 확인해 주세요.",
    educationRequired: "학력을 1건 이상 입력해 주세요.",
    agreementRequired: "동의가 필요합니다.",
    signatureRequired: "서명이 필요합니다.",
    fileRequired: "파일을 첨부해 주세요.",
    fileTooLarge: "파일 하나당 최대 10MB 까지 첨부할 수 있습니다.",
    fileType: "PDF · JPG · PNG 파일만 첨부할 수 있습니다.",
  },

  success: {
    title: "입학신청이 접수되었습니다",
    description:
      "접수번호를 확인해 주세요. 심사 결과와 이후 절차는 학교에서 개별 안내드립니다.",
    applicationNoLabel: "접수번호",
    programLabel: "지원 과정",
    nameLabel: "지원자",
    note: "이 화면을 벗어나면 다시 확인할 수 없습니다. 접수번호를 따로 기록해 두세요.",
    links: [
      { path: "/admission", label: "입학안내" },
      { path: "/consultation", label: "입학상담 신청" },
    ],
    payment: {
      heading: "다음 단계",
      nextStepLabel: "다음 단계",
      nextStepValue: "입학허가비 납부",
      feeLabel: "입학허가비",
      accountHeading: "입금계좌",
      bankLabel: "은행",
      holderLabel: "예금주",
      accountLabel: "계좌번호",
      depositorNote: "입금자명은 지원자 이름과 동일하게 입력해 주세요.",
      processNote:
        "입학허가비 납부 후 입학 심사가 진행되며, 심사 후 입학허가서가 발급되면 등록금을 납부하게 됩니다.",
      separateNote: "입학허가비와 등록금은 별도입니다.",
      copyButton: "계좌번호 복사",
      copied: "계좌번호가 복사되었습니다.",
    },
  },
};
