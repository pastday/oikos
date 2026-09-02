import type { AdmissionContent } from "./types";

/**
 * 온라인 입학신청 폼 영어 문구.
 *
 * 자동 번역이 아니라 한국어판과 같은 사실을 영어로 다시 쓴 것이다. (CLAUDE.md 3항)
 * 항목 이름은 원본 입학원서의 영문 표기를 우선 사용한다.
 */
export const admissionEn: AdmissionContent = {
  intro: {
    eyebrow: "ADMISSION APPLICATION",
    title: "Online Application for Admission",
    description:
      "Apply to the MBA or DBA program at the Oikos University Graduate School of Business. Your entries are submitted as your application for admission.",
  },

  notices: {
    noDraft:
      "This form cannot be saved as a draft. Closing or reloading the page will discard what you have entered. Please prepare your document files first and complete the form in one sitting.",
    documentLanguage:
      "The three statements below are the original English documents provided by the university. No official Korean translation exists, so the originals are shown as they are.",
    privacyPending:
      "The full privacy policy is being prepared. Please review the items collected and the purpose of use below.",
  },

  eligibility: {
    title: "Who should use this form",
    body: "This online application is for MBA and DBA applicants. If you do not hold a bachelor's degree, or if you would like to discuss a degree-completion pathway, please use the admission consultation form instead.",
    cta: "Request a consultation",
  },

  common: {
    requiredMark: "Required",
    optionalMark: "Optional",
    selectPlaceholder: "Please select",
    previous: "Previous",
    next: "Next",
    submit: "Submit application",
    submitting: "Submitting…",
    stepLabel: (current, total) => `Step ${current} of ${total}`,
  },

  steps: [
    "Personal Information",
    "Education & Career",
    "Personal Statement",
    "Statements & Signature",
    "Documents & Submit",
  ],

  step1: {
    title: "Personal Information",
    description: "These are the personal information fields of the application form.",
    programSection: "Degree Program",
    personalSection: "Personal Information",
    emergencySection: "Emergency Contact",
    otherSection: "Other",

    program: {
      label: "Program",
      options: {
        MBA: "MBA (Master of Business Administration)",
        DBA: "DBA (Doctor of Business Administration)",
      },
    },
    admissionYear: { label: "Admission year" },
    admissionTerm: {
      label: "Admission term",
      options: { SPRING: "Spring Semester", FALL: "Fall Semester" },
    },

    nameKo: { label: "Name (Korean)", placeholder: "홍길동" },
    nameEn: {
      label: "Name (English)",
      placeholder: "HONG GILDONG",
      hint: "Enter your name exactly as it appears on your passport.",
    },
    residentNumber: {
      label: "Resident registration number",
      placeholder: "900101-1234567",
      hint: "Stored encrypted; administrators only see a masked value.",
    },
    birthDate: { label: "Date of birth" },
    gender: { label: "Gender", options: { MALE: "Male", FEMALE: "Female" } },
    nationality: { label: "Nationality", placeholder: "Republic of Korea" },
    birthplace: { label: "Place of birth", placeholder: "Seoul" },

    addressKo: { label: "Address (Korean)" },
    addressEn: { label: "Address (English)" },
    phone: { label: "Mobile phone", placeholder: "+82 10-0000-0000" },
    email: { label: "Email", placeholder: "example@email.com" },
    usCitizen: {
      label: "Are you a U.S. citizen?",
      options: { yes: "Yes", no: "No" },
    },

    maritalStatus: {
      label: "Marital status",
      options: { SINGLE: "Single", MARRIED: "Married" },
    },
    driversLicenseNumber: { label: "Driver's license number" },
    driversLicenseIssuedAt: { label: "Place of issue" },

    emergencyName: { label: "Name" },
    emergencyRelationship: {
      label: "Relationship",
      placeholder: "e.g. spouse, father, mother",
    },
    emergencyPhone: { label: "Phone" },
    emergencyAddress: { label: "Address" },
  },

  step2: {
    title: "Education & Career",
    description:
      "List your education starting with the most recently completed degree. Your education and career entries serve as your resume.",
    educationTitle: "Education",
    educationHint: "At least one entry is required.",
    careerTitle: "Career",
    careerHint: "Leave blank if not applicable.",
    addEducation: "+ Add education",
    addCareer: "+ Add career",
    removeRow: "Remove",
    rowLabel: (index) => `Entry ${index}`,

    schoolName: { label: "School name" },
    schoolAddress: { label: "School address" },
    period: { label: "Period attended", placeholder: "e.g. 2015.03 – 2019.02" },
    degreeName: { label: "Degree", placeholder: "e.g. B.B.A." },

    organization: { label: "Organization" },
    careerPeriod: { label: "Period", placeholder: "e.g. 2019.03 – present" },
    position: { label: "Position" },
  },

  step3: {
    title: "Personal Statement",
    description:
      "Please write at least 10 characters for each item. Your answers are submitted as your personal statement.",
    personalIntroduction: {
      label: "About yourself",
      placeholder: "Your background, character and strengths.",
    },
    motivation: {
      label: "Motivation for applying",
      placeholder: "Why you are applying to this program.",
    },
    studyPlan: {
      label: "Study and future plans",
      placeholder: "Your study plan and career plans after graduation.",
    },
  },

  step4: {
    title: "Statements & Signature",
    description:
      "Please read each of the three documents below and sign them. Each document requires its own agreement and signature.",
    agreeLabel: "I have read the above and I agree.",
    signedNameLabel: "Name",
    signedNamePlaceholder: "Enter your name",
    signatureLabel: "Signature",
    signatureHint: "Sign in the box below using your mouse or finger.",
    signatureClear: "Sign again",
    signatureEmpty: "A signature is required.",
    signatureDone: "Signature captured.",
    dateNotice: "The date is recorded automatically at the time of submission.",
  },

  step5: {
    title: "Documents & Submit",
    description:
      "All four required documents must be attached before you can submit.",
    requiredTitle: "Required documents",
    optionalTitle: "Optional documents",
    fileHint: "PDF, JPG or PNG — up to 10MB per file",
    totalLimitHint: "All attachments together must not exceed 18MB.",
    chooseFile: "Choose file",

    files: {
      graduationCertificate: { label: "Graduation certificate" },
      transcript: { label: "Official transcript" },
      passport: { label: "Copy of passport" },
      photo: {
        label: "Photograph",
        hint: "JPG or PNG image files only.",
      },
      insurance: { label: "Student Insurance Certificate" },
      phoneBill: { label: "Phone Bill" },
      electricBill: { label: "Electric Bill" },
      rentBill: { label: "Rent Bill" },
      recommendation: {
        label: "Letter of recommendation",
        hint: "Attach a scan of the completed letter from your recommender.",
      },
    },

    privacyLabel: "I consent to the collection and use of my personal information.",
    privacySummary:
      "Items collected: the entries on this application form and the documents you submit. Purpose: admission review and related communication.",
  },

  alerts: {
    invalid:
      "Please review your entries. You will be taken to the step that needs attention.",
    server: "We could not submit your application. Please try again shortly.",
    totalTooLarge:
      "Your attachments exceed 18MB in total. Please reduce the file sizes or omit optional documents.",
  },

  errors: {
    required: "This field is required.",
    tooLong: "This entry is too long.",
    tooShort: "Please enter at least 10 characters.",
    invalidEmail: "Please check the email format.",
    invalidPhone: "Please check the phone number format.",
    invalidResidentNumber:
      "Please enter all 13 digits of the resident registration number.",
    invalidDate: "Please check the date.",
    invalidYear: "Please check the admission year.",
    invalidChoice: "Please check your selection.",
    educationRequired: "Please add at least one education entry.",
    agreementRequired: "Your agreement is required.",
    signatureRequired: "A signature is required.",
    fileRequired: "Please attach a file.",
    fileTooLarge: "Each file may be up to 10MB.",
    fileType: "Only PDF, JPG and PNG files can be attached.",
  },

  success: {
    title: "Your application has been received",
    description:
      "Please note your application number. The university will contact you individually about the review and the next steps.",
    applicationNoLabel: "Application number",
    programLabel: "Program",
    nameLabel: "Applicant",
    note: "You will not be able to see this screen again. Please record your application number.",
    links: [
      { path: "/admission", label: "Admissions" },
      { path: "/consultation", label: "Admission consultation" },
    ],
    payment: {
      heading: "Next Step",
      nextStepLabel: "Next Step",
      nextStepValue: "Admission Fee Payment",
      feeLabel: "Admission Fee",
      accountHeading: "Payment Account",
      bankLabel: "Bank",
      holderLabel: "Account Holder",
      accountLabel: "Account Number",
      depositorNote:
        "Please use the applicant's name as the depositor name.",
      processNote:
        "After the admission fee is paid, the admission review proceeds. Once the review is complete and the Letter of Admission is issued, tuition payment will follow.",
      separateNote: "The admission fee is separate from tuition.",
      copyButton: "Copy account number",
      copied: "Account number copied.",
    },
  },
};
