/**
 * 사용자 상세 페이지 콘텐츠 타입.
 *
 * 모든 문구의 출처는 사용자가 제공한 원본 자료이며,
 * 자료에 없는 내용은 만들지 않고 해당 필드를 비워 둔다.
 * 이후 단계에서 PageSection 테이블로 옮긴다.
 */

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
  /** 원본 자료에 총장 인사말 본문이 없어 준비 중임을 알리는 안내만 둔다. */
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

export type FacultyContent = {
  intro: PageIntro;
  chief: {
    sectionTitle: string;
    name: string;
    nameAlt: string;
    initials: string;
    role: string;
    major: string;
    affiliation: string;
    details: LabeledItem[];
  };
  /** 원본 자료에 다른 교수 명단이 없다. 없는 교수를 만들지 않고 안내만 둔다. */
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
    altTitleNote: string;
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

export type PageContent = {
  about: AboutContent;
  faculty: FacultyContent;
  mba: ProgramPageContent;
  dba: ProgramPageContent;
  degree: DegreeContent;
  admission: AdmissionContent;
  faq: FaqContent;
  /** 페이지 하단 관련 링크 문구 */
  related: {
    title: string;
    about: string;
    admission: string;
    consultation: string;
    programs: string;
    mba: string;
    dba: string;
    degree: string;
    faq: string;
    faculty: string;
  };
};
