import { formatIntake } from "../program-facts";
import type { HomeContent } from "./types";

const intakeKo = formatIntake("ko");

/**
 * 한국어 메인 페이지 콘텐츠.
 *
 * 출처
 *  - docs/source/홈피구성안.hwp        : 메뉴 구성, HOME 스크롤 순서, Hero 문구
 *  - docs/source/대학원 및 전공 소개.odt : 전공 소개, 학기·학점, 교육과정, 인증
 *  - assets/source/ 모집 이미지          : 석사 4학기·박사 6학기, 2026년 10월 개강, 주임교수 김동준
 *  - assets/source/ 명함                : 주임교수 영문명 Dong-Joon Kim
 *
 * 원본에 없는 내용을 추가하거나 홍보성 표현으로 과장하지 않는다.
 */
export const homeKo: HomeContent = {
  hero: {
    eyebrow: "USA OIKOS UNIVERSITY",
    university: "미국 오이코스대학교",
    title: "경영대학원",
    major: "호텔 · 외식 · 와인경영 전공",
    degrees: "MBA · DBA",
    online: "100% 온라인 과정",
    ctaPrograms: "과정 알아보기",
    ctaConsultation: "입학상담 신청",
    logoAlt: "오이코스대학교 로고",
  },

  // 모집 자료에 명시된 항목만 넣는다.
  facts: [
    { label: "석사 (MBA)", value: "4학기" },
    { label: "박사 (DBA)", value: "6학기" },
    { label: "개강", value: intakeKo },
    { label: "주임교수", value: "김동준" },
  ],

  major: {
    eyebrow: "전공 소개",
    title: "호텔 · 외식 · 와인경영 전공",
    paragraphs: [
      "호텔(Hotel), 외식(Foodservice), 와인(Wine)의 융복합 전공입니다. 경영학 이론을 바탕으로 고도의 실무적 관광산업 경영 훈련을 실시하여, 기업의 전문 엘리트 배출을 목표로 합니다.",
      "호텔 경영, 와인 및 외식서비스, 관광산업의 융합 전문가로서의 역량을 키우고, 각 분야의 전문역량 강화와 브랜드 차별화, 호텔관광마케팅 기획이 실제 산업에 적용될 수 있는 경영 수업을 다룹니다.",
      "고객의, 고객에 의한, 고객을 위한 고객중심 서비스문화의 핵심인 호텔외식와인 경영을 배우고 실천하며 연구하는 데 학습의 주안점을 두고 있습니다.",
    ],
    ficbNote:
      "우수한 수료자에게는 FICB(세계와인기사단총연합) 국제 와인기사작위를 받을 수 있는 기회가 제공됩니다.",
  },

  pillars: {
    title: "네 가지 핵심 영역",
    description:
      "관광산업 각 분야의 융복합을 다룰 수 있도록 교육과정을 구성합니다.",
    items: [
      {
        key: "hotel",
        title: "호텔경영",
        description:
          "호텔·리조트의 서비스 구조와 운영 방식, 고객 경험 설계를 다룹니다.",
      },
      {
        key: "foodservice",
        title: "외식경영",
        description:
          "외식산업의 구조와 운영 특성, 시장 변화와 경영 전략을 다룹니다.",
      },
      {
        key: "wine",
        title: "와인경영",
        description:
          "세계 와인 문화와 역사, 와인 브랜드와 산업의 형성 구조를 다룹니다.",
      },
      {
        key: "tourism",
        title: "관광 · 환대산업",
        description:
          "글로벌 관광산업의 구조, MICE·축제·이벤트와 관광마케팅을 다룹니다.",
      },
    ],
  },

  programs: {
    eyebrow: "학위과정",
    title: "MBA · DBA 과정",
    description:
      "일하면서 학위과정을 병행하려는 실무 전문가에 맞춘 전문형 학위과정입니다.",
    labels: { duration: "학기", credits: "총 취득학점" },
    items: [
      {
        code: "MBA",
        degreeName: "경영학석사",
        tagline: "이론강의 중심의 석사과정",
        duration: "4학기제",
        totalCredits: "36학점",
        creditBreakdown: "전공 24학점 · 공통 12학점",
        chapel: "채플 3과목 별도",
        href: "/ko/programs/mba",
        cta: "MBA 자세히 보기",
      },
      {
        code: "DBA",
        degreeName: "경영학박사",
        tagline: "실무 전문형 박사과정",
        duration: "6학기제",
        totalCredits: "45학점",
        creditBreakdown: "전공 30학점 · 공통 15학점",
        chapel: "채플 4과목 별도",
        note: "6학기는 논문학기",
        href: "/ko/programs/dba",
        cta: "DBA 자세히 보기",
      },
    ],
  },

  online: {
    badge: "100% ONLINE",
    title: "온라인으로 진행되는 경영대학원 과정",
    description:
      "일하면서 학위과정을 병행하려는 실무 전문가를 위해 개설된 온라인 대학원 과정입니다.",
    scheduleTitle: "학위과정 학기",
    schedule: [
      "1학기 · 2 ~ 4월",
      "2학기 · 6 ~ 8월",
      "3학기 · 10 ~ 12월",
      "방학 · 5월, 9월, 1월",
    ],
  },

  curriculum: {
    eyebrow: "교육과정",
    title: "주요 교과목",
    description:
      "호텔·외식·와인과 관광산업을 아우르는 이론 교과목으로 구성되어 있습니다.",
    courses: [
      {
        title: "글로벌 관광산업의 구조와 전개",
        subtitle: "Global Structure and Development of the Tourism Industry",
      },
      {
        title: "세계 와인 문화와 역사적 발전",
        subtitle: "Global Wine Culture and Historical Development",
      },
      {
        title: "호텔, 리조트, 외식 서비스 시스템의 이해",
        subtitle: "Hospitality Service Systems: Hotels, Resorts, and Foodservice",
      },
      {
        title: "와인 브랜드와 관광지 형성의 메카니즘",
        subtitle: "Wine Brands and the Mechanism of Destination Formation",
      },
      {
        title: "미식 와인 관광의 개념과 적용",
        subtitle: "Concepts and Applications of Gastronomic Wine Tourism",
      },
      {
        title: "MICE 컨벤션의 체계적 이해",
        subtitle: "Systematic Understanding of MICE and Conventions",
      },
    ],
    note: "교과목은 학기 사정에 따라 변경될 수 있습니다.",
    cta: "전체 교육과정 보기",
  },

  faculty: {
    eyebrow: "교수진",
    title: "주임교수",
    description: "전공 교육과정을 총괄하는 주임교수입니다.",
    chief: {
      name: "김동준",
      nameEn: "Dong-Joon Kim",
      initials: "DK",
      title: "주임교수",
      affiliation: "호텔·외식·와인경영 전공",
    },
    cta: "교수진 보기",
  },

  degree: {
    eyebrow: "학위 및 인증",
    title: "학위와 인증 정보를 확인하세요",
    description:
      "오이코스대학교의 인가 현황과 학위 관련 정보를 안내합니다.",
    cta: "학위 및 인증 알아보기",
  },

  admission: {
    eyebrow: "입학안내",
    title: `${intakeKo} 개강`,
    description: "모집요강과 입학절차를 확인하실 수 있습니다.",
    items: [
      { label: "MBA", value: "4학기" },
      { label: "DBA", value: "6학기" },
      { label: "수업방식", value: "100% 온라인" },
      { label: "개강", value: intakeKo },
    ],
    ctaGuide: "모집요강 보기",
    ctaConsultation: "입학상담 신청",
  },

  consultation: {
    title: "입학을 준비하고 계신가요?",
    description:
      "MBA · DBA 과정과 입학절차에 대해 상담해드립니다.",
    cta: "입학상담 신청",
  },
};
