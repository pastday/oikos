/**
 * 사용자 상세 페이지 콘텐츠 타입.
 *
 * 모든 문구의 출처는 사용자가 제공한 원본 자료이며,
 * 자료에 없는 내용은 만들지 않고 해당 필드를 비워 둔다.
 * 이후 단계에서 PageSection 테이블로 옮긴다.
 */

import type {
  ConsultationErrorCode,
  SeminarErrorCode,
} from "@/lib/validation/inquiry";

export type PageIntro = {
  eyebrow: string;
  title: string;
  description: string;
};

export type TextBlock = {
  title: string;
  paragraphs: string[];
};

export type LabeledItem = {
  label: string;
  value: string;
  note?: string;
};

export type NoticeBlock = {
  title: string;
  body: string;
};

// ---------------------------------------------------------------------------

export type AboutContent = {
  intro: PageIntro;
  /**
   * 총장 인사말. 공개 화면의 출처는 CMS(`PageSection` about/president)다.
   * 이 값은 이관 원본이며, 화면은 DB 를 읽는다.
   */
  presidentNotice: NoticeBlock;
  school: TextBlock;
  philosophy: TextBlock;
  goals: {
    title: string;
    items: { title: string; description: string }[];
  };
  university: {
    title: string;
    paragraphs: string[];
    facts: LabeledItem[];
    degreeLinkLabel: string;
    officialSiteLabel: string;
  };
};

/**
 * 교수진 페이지의 **문구만** 담는다.
 * 교수 개개인의 정보는 9단계부터 DB(`Faculty`)에서 읽는다.
 */
export type FacultyContent = {
  intro: PageIntro;
  /** 교수 구분별 섹션 제목 */
  groupTitles: {
    CHIEF_PROFESSOR: string;
    PROFESSOR: string;
    VISITING_PROFESSOR: string;
  };
  /** 교수 카드 안의 항목 라벨 */
  labels: {
    major: string;
    /** 상세 프로필 (14단계). 값이 없는 항목은 라벨째 그리지 않는다. */
    bio: string;
    education: string;
    career: string;
    /** 전문분야. DB 는 `lectureFields` 한 필드로 강의 분야와 함께 관리한다. */
    lectureFields: string;
  };
  /** 공개된 교수가 한 명도 없을 때 */
  emptyNotice: NoticeBlock;
  /** 원본 자료에 아직 다른 교수 명단이 없다는 안내. 없는 교수를 만들지 않는다. */
  pendingNotice: NoticeBlock;
  contactNotice: string;
};

export type ProgramPageContent = {
  intro: PageIntro;
  overview: TextBlock;
  summary: {
    title: string;
    items: LabeledItem[];
  };
  features: {
    title: string;
    items: { title: string; description: string }[];
  };
  /** DBA 만 사용하는 교육과정 체계(모듈). MBA 는 undefined. */
  modules?: {
    title: string;
    description: string;
    items: { name: string; summary: string; details: string[] }[];
  };
  curriculum: {
    title: string;
    description: string;
    /** "{n}" 자리에 학기 번호가 들어간다. 콘텐츠를 순수 데이터로 유지하기 위해 함수 대신 템플릿을 쓴다. */
    semesterLabelTemplate: string;
    majorTitle: string;
    additionalTitle: string;
    additionalNote: string;
    commonTitle: string;
    creditsUnit: string;
    creditsUnknown: string;
    formatLabel: string;
    descriptionPending: string;
    note: string;
  };
  graduation: {
    title: string;
    items: LabeledItem[];
    note?: string;
  };
};

export type DegreeContent = {
  intro: PageIntro;
  degrees: {
    title: string;
    description: string;
    items: { code: string; name: string; summary: string }[];
  };
  foreignDoctorate: {
    title: string;
    paragraphs: string[];
    highlight: string;
    registrar: string;
  };
  accreditation: {
    title: string;
    description: string;
    items: { name: string; body: string }[];
    note: string;
  };
  university: {
    title: string;
    paragraphs: string[];
    officialSiteLabel: string;
  };
  faqLink: {
    title: string;
    description: string;
    cta: string;
  };
};

export type AdmissionContent = {
  intro: PageIntro;
  /**
   * 모집요강 PDF 링크 문구.
   * 관리자가 PDF 를 지정했을 때만 화면에 나온다. 지정하지 않으면 링크 자체가 없다.
   */
  guideline: { label: string; newWindow: string };
  recruit: {
    title: string;
    description: string;
    items: LabeledItem[];
  };
  eligibility: TextBlock & { note: string };
  tuition: {
    title: string;
    description: string;
    columns: string[];
    rows: { program: string; cells: string[] }[];
    notes: string[];
  };
  steps: {
    title: string;
    description: string;
    items: { title: string; description: string }[];
  };
  calendar: {
    title: string;
    description: string;
    items: { period: string; label: string; type: "semester" | "break" }[];
  };
};

export type FaqContent = {
  intro: PageIntro;
  items: { question: string; answer: string }[];
  note: string;
};

// ---------------------------------------------------------------------------
// 입학상담 · 설명회 신청 (6단계)
// ---------------------------------------------------------------------------

export type FormFieldText = {
  label: string;
  placeholder?: string;
  /** 입력 요령 안내. 없으면 표시하지 않는다. */
  hint?: string;
};

/**
 * 두 신청 폼이 공통으로 쓰는 문구.
 * `errors` 는 서버가 돌려준 오류 코드를 사람이 읽을 문구로 바꾸는 표다.
 * 코드가 늘면 Record 타입 때문에 한국어·영어 양쪽에서 컴파일 오류가 난다.
 */
export type InquiryFormText<Code extends string> = {
  requiredMark: string;
  optionalMark: string;
  submit: string;
  submitting: string;
  privacy: {
    label: string;
    /** 수집 항목·이용 목적. 확인된 사실만 적는다. */
    summary: string;
    /** 개인정보 처리방침 전문이 아직 없다는 안내. */
    pendingNotice: string;
  };
  invalidAlert: string;
  serverError: string;
  success: { title: string; description: string };
  errors: Record<Code, string>;
};

export type ConsultationContent = {
  intro: PageIntro;
  guide: {
    title: string;
    description: string;
    items: { title: string; description: string }[];
  };
  /** 대표 전화·카카오톡 채널이 확정되지 않아 가짜 링크를 만들지 않는다. */
  channelNotice: NoticeBlock;
  form: {
    title: string;
    description: string;
    fields: {
      name: FormFieldText;
      phone: FormFieldText;
      email: FormFieldText;
      interestedProgram: FormFieldText & {
        placeholder: string;
        options: { value: "MBA" | "DBA"; label: string }[];
      };
      message: FormFieldText;
    };
    text: InquiryFormText<ConsultationErrorCode>;
    successLinks: { path: string; label: string }[];
  };
  seminarLink: { title: string; description: string; cta: string };
};

export type SeminarContent = {
  intro: PageIntro;
  /** 확정된 설명회 일정이 없다는 안내. 없는 날짜를 만들지 않는다. */
  scheduleNotice: NoticeBlock;
  form: {
    title: string;
    description: string;
    fields: {
      name: FormFieldText;
      phone: FormFieldText;
      email: FormFieldText;
      preferredSession: FormFieldText;
      attendeeCount: FormFieldText;
      memo: FormFieldText;
    };
    text: InquiryFormText<SeminarErrorCode>;
    successLinks: { path: string; label: string }[];
  };
  consultationLink: { title: string; description: string; cta: string };
};

export type PageContent = {
  about: AboutContent;
  faculty: FacultyContent;
  mba: ProgramPageContent;
  dba: ProgramPageContent;
  degree: DegreeContent;
  admission: AdmissionContent;
  faq: FaqContent;
  consultation: ConsultationContent;
  seminar: SeminarContent;
  /** 페이지 하단 관련 링크 문구 */
  related: {
    title: string;
    about: string;
    admission: string;
    consultation: string;
    seminar: string;
    programs: string;
    mba: string;
    dba: string;
    degree: string;
    faq: string;
    faculty: string;
  };
};
