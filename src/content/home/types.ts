/**
 * 메인 페이지 콘텐츠 타입.
 *
 * 4단계에서는 아직 DB를 읽지 않으므로 콘텐츠를 이 파일 구조로 관리한다.
 * 이후 단계에서 PageSection / Program / Course / Faculty 테이블로 옮길 때
 * 그대로 대응되도록 필드를 구성했다.
 *
 * 모든 값의 출처는 사용자가 제공한 원본 자료(docs/source, assets/source)이다.
 * 원본에 없는 수치·명칭·홍보 문구를 임의로 만들어내지 않는다.
 */

export type HomeFact = {
  label: string;
  value: string;
};

export type Pillar = {
  key: "hotel" | "foodservice" | "wine" | "tourism";
  title: string;
  description: string;
};

export type ProgramSummary = {
  /** 화면 표기는 프로젝트 결정에 따라 MBA / DBA 를 사용한다. */
  code: "MBA" | "DBA";
  /** 원본 문서상의 학위 표기 */
  degreeName: string;
  tagline: string;
  duration: string;
  totalCredits: string;
  creditBreakdown: string;
  chapel: string;
  note?: string;
  href: string;
  cta: string;
};

export type CoursePreview = {
  /** 해당 언어에서 앞에 표시할 교과목명 */
  title: string;
  /** 보조로 함께 노출하는 다른 언어 교과목명 */
  subtitle: string;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    university: string;
    title: string;
    major: string;
    degrees: string;
    online: string;
    ctaPrograms: string;
    ctaConsultation: string;
    logoAlt: string;
  };
  facts: HomeFact[];
  major: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    ficbNote: string;
  };
  pillars: {
    title: string;
    description: string;
    items: Pillar[];
  };
  programs: {
    eyebrow: string;
    title: string;
    description: string;
    labels: { duration: string; credits: string };
    items: ProgramSummary[];
  };
  online: {
    badge: string;
    title: string;
    description: string;
    scheduleTitle: string;
    schedule: string[];
  };
  curriculum: {
    eyebrow: string;
    title: string;
    description: string;
    courses: CoursePreview[];
    note: string;
    cta: string;
  };
  faculty: {
    eyebrow: string;
    title: string;
    description: string;
    chief: {
      name: string;
      nameEn: string;
      initials: string;
      title: string;
      affiliation: string;
    };
    cta: string;
  };
  degree: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
  };
  admission: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomeFact[];
    ctaGuide: string;
    ctaConsultation: string;
  };
  consultation: {
    title: string;
    description: string;
    cta: string;
  };
};
