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

/**
 * 과정 카드의 **문구**만 담는다.
 * 학위명·학기 수·학점은 DB(`Program`)에서 읽어 화면에서 합친다.
 */
export type ProgramSummary = {
  /** 화면 표기는 프로젝트 결정에 따라 MBA / DBA 를 사용한다. */
  code: "MBA" | "DBA";
  tagline: string;
  /** 원본 자료에 근거한 부가 안내 (예: 논문학기) */
  note?: string;
  href: string;
  cta: string;
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
    labels: {
      duration: string;
      credits: string;
      /** "{major}" / "{common}" 자리에 학점이 들어간다 */
      breakdownTemplate: string;
      /** "{n}" 자리에 과목 수가 들어간다 */
      chapelTemplate: string;
    };
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
    note: string;
    cta: string;
  };
  faculty: {
    eyebrow: string;
    title: string;
    description: string;
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
