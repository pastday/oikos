import {
  dbaFacts,
  exchangeRateBase,
  fees,
  formatIntake,
  formatKrw,
  mbaFacts,
} from "../program-facts";
import type { PageContent } from "./types";

const intakeKo = formatIntake("ko");
const krw = (amount: number) => formatKrw(amount, "ko");

/**
 * 한국어 상세 페이지 콘텐츠.
 *
 * 출처
 *  - docs/source/홈피구성안.hwp        : 페이지·섹션 구성
 *  - docs/source/대학원 및 전공 소개.odt : 설립목적, 학위·학점, 교육과정, 등록금, 인증
 *  - assets/source/ 모집 이미지          : 개강 시점, 주임교수
 *  - assets/source/ 명함                : 주임교수 영문명·직함
 *
 * 원본에 없는 내용을 사실처럼 추가하지 않는다.
 * 인증·인가 관련 표현은 원본보다 강하게 바꾸지 않는다.
 */
export const pagesKo: PageContent = {
  // -------------------------------------------------------------------------
  about: {
    intro: {
      eyebrow: "대학원 소개",
      title: "미국 오이코스대학교 경영대학원",
      description:
        "일하면서 학위과정을 병행하려는 실무 전문가를 위해 개설된 온라인 경영대학원입니다.",
    },
    presidentNotice: {
      title: "총장 인사말",
      body: "총장 인사말은 현재 준비 중입니다. 확정되는 대로 이 영역에 게재됩니다.",
    },
    school: {
      title: "경영대학원 소개",
      paragraphs: [
        "박사학위에는 실무 전문형 박사(Doctor)와 이론형 박사(PhD) 두 종류가 있습니다. 국내 박사학위 과정은 대부분 전일제 학생을 대상으로 하는 이론 박사학위 과정입니다.",
        "본 대학원은 주경야독(晝耕夜讀)으로 일하면서 학위과정을 다니려는 실무 전문가에 맞추어 전문형 경영학 박사과정과 석사과정을 개설했습니다.",
        "호텔·외식·와인 경영 등 각 분야의 전문적 지식과 경험을 바탕으로 경영학과 접목하는 융합형 학위과정이며, 그 외 Hospitality 관광서비스 경영 전공 분야에 관심이 있는 분 모두를 환영합니다.",
      ],
    },
    philosophy: {
      title: "교육철학",
      paragraphs: [
        "호텔(Hotel), 외식(Foodservice), 와인(Wine)의 융복합 전공으로, 경영학적 이론을 바탕으로 고도의 실무적 관광산업 경영 훈련을 실시합니다.",
        "호텔, 와인, 외식 등 관련 관광산업 각 분야의 융복합이 본격화되면서 호텔관광분야의 콘텐츠 수요가 빠르게 증가하고 있으나, 대학원 석사·박사과정에서 일체형 교육은 미흡한 상황입니다.",
        "본 전공의 장점을 살려 고객의, 고객에 의한, 고객을 위한 고객중심 서비스문화의 핵심인 호텔외식와인 경영을 배우고 실천하며 연구하는 데 학습의 주안점을 두고 있습니다.",
      ],
    },
    goals: {
      title: "교육 목표",
      items: [
        {
          title: "전문 엘리트 배출",
          description:
            "호텔외식와인 분야에 대한 기술적 이해를 기반으로 기업의 전문 엘리트 배출을 목표로 합니다.",
        },
        {
          title: "융합 전문가 역량",
          description:
            "호텔 경영, 와인 및 외식서비스, 관광산업의 융합 전문가로서의 역량을 키웁니다.",
        },
        {
          title: "실제 산업 적용",
          description:
            "각 분야의 전문역량 강화, 브랜드 및 차별화, 호텔관광마케팅에 대한 기획이 실제 산업에 적용될 수 있는 경영 수업을 다룹니다.",
        },
        {
          title: "일체형 교육",
          description:
            "산업 전반에 종사하는 구성원에게 관광 콘텐츠 전반을 다룰 수 있는 일체형 교육을 제공합니다.",
        },
      ],
    },
    university: {
      title: "Oikos University 소개",
      paragraphs: [
        "오이코스대학교(Oikos University)는 재미교포 김종인 목사가 2004년 로스앤젤레스 셰퍼드대학 분교로 설립하였고, 2007년 독립대학으로 발전하였습니다.",
        "미국 캘리포니아주 오클랜드에 위치한 사립 교육기관입니다.",
      ],
      facts: [
        { label: "설립", value: "2004년" },
        { label: "독립대학 발전", value: "2007년" },
        { label: "소재지", value: "미국 캘리포니아주 오클랜드" },
      ],
      degreeLinkLabel: "인가 및 인증 정보 보기",
      officialSiteLabel: "미국 본교 홈페이지",
    },
  },

  // -------------------------------------------------------------------------
  faculty: {
    intro: {
      eyebrow: "교수진",
      title: "교수진",
      description:
        "호텔·외식·와인경영 전공의 교육과정을 총괄하는 교수진입니다.",
    },
    chief: {
      sectionTitle: "주임교수",
      name: "김동준",
      nameAlt: "Dong-Joon Kim",
      initials: "DK",
      role: "주임교수",
      major: "호텔·외식·와인경영 전공",
      affiliation: "온라인 경영대학원",
      details: [
        { label: "구분", value: "주임교수" },
        { label: "전공", value: "호텔·외식·와인경영" },
        { label: "영문 표기", value: "Dong-Joon Kim" },
      ],
    },
    pendingNotice: {
      title: "교수진 · 객원교수",
      body: "교수진과 객원교수 명단은 현재 준비 중입니다. 확정되는 대로 이 영역에 게재됩니다.",
    },
    contactNotice:
      "교수 개인 연락처는 공개하지 않습니다. 과정에 대한 문의는 입학상담을 이용해 주세요.",
  },

  // -------------------------------------------------------------------------
  mba: {
    intro: {
      eyebrow: "MBA",
      title: "경영학석사 (MBA)",
      description: `${mbaFacts.semesters}학기제 · 총 ${mbaFacts.totalCredits}학점 · 100% 온라인으로 진행되는 이론강의 중심의 석사과정입니다.`,
    },
    overview: {
      title: "과정 개요",
      paragraphs: [
        "일하면서 학위과정을 병행하려는 실무 전문가에 맞춘 전문형 경영학 석사과정입니다.",
        "호텔, 외식, 와인 경영 등 각 분야의 전문적 지식과 경험을 바탕으로 경영학과 접목하는 융합형 학위과정으로, 이론강의를 중심으로 운영됩니다.",
      ],
    },
    summary: {
      title: "학위기간 및 학점",
      items: [
        { label: "학위 기간", value: `${mbaFacts.semesters}학기제` },
        {
          label: "학기 당 수강",
          value: `${mbaFacts.coursesPerSemester}과목 ${mbaFacts.creditsPerSemester}학점`,
        },
        { label: "총 취득학점", value: `${mbaFacts.totalCredits}학점` },
        {
          label: "학점 구성",
          value: `전공 ${mbaFacts.majorCredits}학점 · 공통 ${mbaFacts.commonCredits}학점`,
        },
        {
          label: "채플",
          value: `${mbaFacts.chapelCourses}과목`,
          note: "학점과 별도",
        },
        { label: "수업방식", value: "100% 온라인" },
      ],
    },
    features: {
      title: "교육 특징",
      items: [
        {
          title: "이론강의 중심",
          description:
            "석사과정은 이론강의를 중심으로 구성되어 있습니다.",
        },
        {
          title: "융합형 교육과정",
          description:
            "호텔·외식·와인의 융복합을 경영학 이론과 접목한 교육과정입니다.",
        },
        {
          title: "직장과 병행",
          description:
            "일하면서 학위과정을 다니려는 실무 전문가를 위해 온라인으로 운영됩니다.",
        },
      ],
    },
    curriculum: {
      title: "교육과정",
      description:
        "학기차가 지정된 전공과목과 공통과목으로 구성됩니다.",
      semesterLabelTemplate: "{n}학기차",
      majorTitle: "전공과목",
      additionalTitle: "그 밖의 전공과목",
      additionalNote:
        "원본 교육과정 자료에 학기차 표기 없이 함께 안내된 과목입니다.",
      commonTitle: "공통과목 (경영학 관련)",
      creditsUnit: "학점",
      creditsUnknown: "학점 미표기",
      formatLabel: "구분",
      altTitleNote: "원본 자료에 영문 과목명이 두 가지로 기재되어 있습니다.",
      descriptionPending: "교과 내용은 준비 중입니다.",
      note: "교과목은 학기 사정에 따라 변경될 수 있습니다.",
    },
    graduation: {
      title: "졸업 관련 안내",
      items: [
        { label: "총 취득학점", value: `${mbaFacts.totalCredits}학점` },
        { label: "전공", value: `${mbaFacts.majorCredits}학점` },
        { label: "공통", value: `${mbaFacts.commonCredits}학점` },
        { label: "채플", value: `${mbaFacts.chapelCourses}과목 (별도)` },
      ],
    },
  },

  // -------------------------------------------------------------------------
  dba: {
    intro: {
      eyebrow: "DBA",
      title: "경영학박사 (DBA)",
      description: `${dbaFacts.semesters}학기제 · 총 ${dbaFacts.totalCredits}학점 · 100% 온라인으로 진행되는 실무 전문형 박사과정입니다.`,
    },
    overview: {
      title: "과정 개요",
      paragraphs: [
        "박사학위에는 실무 전문형 박사(Doctor)와 이론형 박사(PhD) 두 종류가 있습니다. 본 과정은 주경야독으로 일하면서 학위과정을 다니려는 실무 전문가에 맞춘 전문형 경영학 박사과정입니다.",
        "호텔, 외식, 와인 경영 등 각 분야의 전문적 지식과 경험을 바탕으로 경영학과 접목하는 융합형 학위과정입니다.",
      ],
    },
    summary: {
      title: "학위기간 및 학점",
      items: [
        { label: "학위 기간", value: `${dbaFacts.semesters}학기제` },
        {
          label: "학기 당 수강",
          value: `${dbaFacts.coursesPerSemester}과목 ${dbaFacts.creditsPerSemester}학점`,
        },
        { label: "총 취득학점", value: `${dbaFacts.totalCredits}학점` },
        {
          label: "학점 구성",
          value: `전공 ${dbaFacts.majorCredits}학점 · 공통 ${dbaFacts.commonCredits}학점`,
        },
        {
          label: "채플",
          value: `${dbaFacts.chapelCourses}과목`,
          note: "학점과 별도",
        },
        {
          label: `${dbaFacts.thesisSemester}학기`,
          value: "논문학기",
        },
      ],
    },
    features: {
      title: "교육 특징",
      items: [
        {
          title: "실무 전문형 박사",
          description:
            "이론형 박사(PhD)와 달리 실무 전문가를 위한 전문형 박사과정입니다.",
        },
        {
          title: "모듈형 교육과정",
          description:
            "기초·코어·연구·프로젝트·논문 모듈로 이어지는 단계적 교육과정입니다.",
        },
        {
          title: "논문학기",
          description: `${dbaFacts.thesisSemester}학기는 논문학기로 운영됩니다.`,
        },
      ],
    },
    modules: {
      title: "교육과정 체계",
      description:
        "이론강의에서 시작해 세미나, 연구방법론, 프로젝트를 거쳐 논문으로 이어집니다.",
      items: [
        {
          name: "기초모듈",
          summary: "이론강의",
          details: ["호텔운영, 외식마케팅 및 서비스리더십", "와인산업, 관광경영 및 소비자행동"],
        },
        {
          name: "코어모듈",
          summary: "논문주제 탐색 전공별 세미나",
          details: ["세미나 Ⅰ · Ⅱ", "세미나 Ⅲ · Ⅳ", "세미나 Ⅴ · Ⅵ"],
        },
        {
          name: "연구모듈",
          summary: "연구방법론 강의",
          details: ["문헌검색", "연구방법론", "통계분석"],
        },
        {
          name: "프로젝트모듈",
          summary: "실무 전문분야별 데이터베이스 구축 및 분석",
          details: [
            "프로젝트 사전조사",
            "프로젝트 제안",
            "프로젝트 진행",
            "프로젝트 심사",
          ],
        },
        {
          name: "논문모듈",
          summary: "프로젝트 결과를 바탕으로 논문 작성",
          details: ["논문분석", "논문종합", "논문심사"],
        },
      ],
    },
    curriculum: {
      title: "교육과정",
      description:
        "학기차가 지정된 전공과목과 공통과목으로 구성됩니다.",
      semesterLabelTemplate: "{n}학기차",
      majorTitle: "전공과목",
      additionalTitle: "그 밖의 전공과목",
      additionalNote:
        "원본 교육과정 자료에 학기차 표기 없이 함께 안내된 과목입니다.",
      commonTitle: "공통과목 (경영학 관련)",
      creditsUnit: "학점",
      creditsUnknown: "학점 미표기",
      formatLabel: "구분",
      altTitleNote: "원본 자료에 영문 과목명이 두 가지로 기재되어 있습니다.",
      descriptionPending: "교과 내용은 준비 중입니다.",
      note: "교과목은 학기 사정에 따라 변경될 수 있습니다.",
    },
    graduation: {
      title: "졸업 관련 안내",
      items: [
        { label: "총 취득학점", value: `${dbaFacts.totalCredits}학점` },
        { label: "전공", value: `${dbaFacts.majorCredits}학점` },
        { label: "공통", value: `${dbaFacts.commonCredits}학점` },
        { label: "채플", value: `${dbaFacts.chapelCourses}과목 (별도)` },
      ],
      note: `${dbaFacts.thesisSemester}학기는 논문학기로 운영됩니다.`,
    },
  },

  // -------------------------------------------------------------------------
  degree: {
    intro: {
      eyebrow: "학위 및 인증",
      title: "학위 및 인증",
      description:
        "개설 학위와 오이코스대학교의 인가·인증 관련 정보를 안내합니다.",
    },
    degrees: {
      title: "학위 안내",
      description: "온라인 경영대학원에서 개설한 학위과정입니다.",
      items: [
        {
          code: "MBA",
          name: "경영학석사",
          summary: `${mbaFacts.semesters}학기제 · 총 ${mbaFacts.totalCredits}학점`,
        },
        {
          code: "DBA",
          name: "경영학박사",
          summary: `${dbaFacts.semesters}학기제 · 총 ${dbaFacts.totalCredits}학점`,
        },
      ],
    },
    foreignDoctorate: {
      title: "외국 박사학위 신고제도",
      paragraphs: [
        "외국 박사학위 신고제도란 고등교육법 제27조에 의거하여, 외국에서 박사학위를 취득한 사람이 학위취득 사실을 '외국 박사학위 신고' 시스템에 등록하는 것을 말합니다.",
        "시행 목적은 외국의 대학에서 박사학위를 취득한 한국인의 현황 파악과, 외국에서 박사학위를 받은 연구자들의 학위논문을 일반 대중에게 공개함으로써 차세대 연구자에 대한 학술적 기여 등 국가인적자원 활용을 위한 기초 자료를 수집하는 데 있습니다.",
      ],
      highlight: "이 제도는 학위의 진위 여부를 확인하는 제도가 아닙니다.",
      registrar:
        "USA OIKOS UNIVERSITY(미 오이코스 대학교)는 한국연구재단에서 실시하는 외국 박사학위 신고 등록 대학교로서, 한국연구재단의 인정을 받은 대학교입니다.",
    },
    accreditation: {
      title: "인가 및 인증",
      description:
        "아래 내용은 제공된 대학 소개 자료에 기재된 내용을 그대로 정리한 것입니다.",
      items: [
        {
          name: "BPPE 승인",
          body: "오이코스대학교는 미국 캘리포니아주 오클랜드에 위치한 사립 학교로 인준받은 정규종합대학교로서, 캘리포니아 사립 고등 교육국에서 승인한 사립 교육기관입니다.",
        },
        {
          name: "미국 교육부",
          body: "오이코스대학교는 현재 미국 교육부에서 인정하는 공인 고등교육기관 및 프로그램 데이터베이스에 포함된 교육기관입니다.",
        },
        {
          name: "TRACS 인증",
          body: "오이코스대학교는 기독교 대학 및 학교 협회(TRACS) 인증위원회로부터 2021년 4월 12일 카테고리 IV 기관으로 인증상태를 재확인 받았습니다. TRACS는 미국 교육부(USDOE), 고등교육 인증 위원회(CHEA) 및 고등교육 품질 보증 기관을 위한 국제 네트워크(INQAAHE)의 인정을 받았습니다.",
        },
        {
          name: "CHEA 인증",
          body: "오이코스대학교는 현재 미국 공인 인증 기관의 인증을 받은 기관 데이터베이스에 포함되어 있습니다.",
        },
        {
          name: "SEVIS I-20",
          body: "오이코스대학교는 미국 시민권 및 이민 서비스국(USCIS)의 승인을 받아 유학생을 받고 등록하며, 학생 및 교환 방문자 정보 시스템(SEVIS)을 통해 외국인 학생들에게 I-20을 발급합니다.",
        },
      ],
      note: "인가·인증의 최신 상태는 각 기관의 공식 자료를 통해 확인하시기 바랍니다.",
    },
    university: {
      title: "미국 본교 소개",
      paragraphs: [
        "오이코스대학교(Oikos University)는 재미교포 김종인 목사가 2004년 로스앤젤레스 셰퍼드대학 분교로 설립하였고, 2007년 독립대학으로 발전하였습니다.",
        "미국 캘리포니아주 오클랜드에 위치하고 있습니다.",
      ],
      officialSiteLabel: "미국 본교 홈페이지",
    },
    faqLink: {
      title: "자주 묻는 질문",
      description: "학위와 과정에 대해 자주 묻는 질문을 모았습니다.",
      cta: "FAQ 보기",
    },
  },

  // -------------------------------------------------------------------------
  admission: {
    intro: {
      eyebrow: "입학안내",
      title: `${intakeKo} 개강`,
      description:
        "모집 개요, 지원자격, 등록금, 입학절차, 학사일정을 안내합니다.",
    },
    recruit: {
      title: "모집안내",
      description: "온라인으로 진행되는 경영대학원 석·박사과정을 모집합니다.",
      items: [
        { label: "개강", value: intakeKo },
        { label: "수업방식", value: "100% 온라인" },
        { label: "MBA", value: `${mbaFacts.semesters}학기` },
        { label: "DBA", value: `${dbaFacts.semesters}학기` },
      ],
    },
    eligibility: {
      title: "지원자격",
      paragraphs: [
        "호텔, 외식, 와인 경영 등 각 분야에서 최고 인재들을 양성하기 위한 과정입니다.",
        "각 분야의 전문적 지식과 경험을 바탕으로 경영학과 접목하는 융합형 학위과정이며, 그 외 Hospitality 관광서비스 경영 전공 분야에 관심이 있는 분 모두를 환영합니다.",
      ],
      note: "구체적인 학력 요건 등 세부 지원자격은 입학상담을 통해 안내해 드립니다.",
    },
    tuition: {
      title: "등록금",
      description: "제공된 자료에 기재된 금액입니다.",
      columns: [
        "학위과정",
        "등록금",
        "입학허가 심사비",
        "홈페이지 사용료 (LMS)",
        "행정등록비",
      ],
      rows: [
        {
          program: "경영학박사 (DBA)",
          cells: [
            krw(dbaFacts.tuition),
            krw(fees.admissionReview),
            "-",
            krw(fees.administrative),
          ],
        },
        {
          program: "경영학석사 (MBA)",
          cells: [
            krw(mbaFacts.tuition),
            krw(fees.admissionReview),
            "-",
            krw(fees.administrative),
          ],
        },
      ],
      notes: [
        `등록금은 원본 자료의 환율 기준(1달러 = ${exchangeRateBase.toLocaleString("en-US")}원)으로 표기된 금액입니다.`,
        "홈페이지 사용료(LMS)는 원본 자료에 금액이 표기되어 있지 않습니다.",
        "등록금은 변경될 수 있으므로 지원 전 입학상담을 통해 확인해 주세요.",
      ],
    },
    steps: {
      title: "입학절차",
      description: "석사·박사과정 모두 아래 절차로 진행됩니다.",
      items: [
        {
          title: "입학서류 제출",
          description: "입학서류를 PDF 파일로 제출합니다.",
        },
        {
          title: "입학허가 심사비 납부",
          description: `입학허가 심사비 ${krw(fees.admissionReview)}을 납부합니다.`,
        },
        {
          title: "입학허가",
          description: "심사 후 입학허가가 이루어집니다.",
        },
        {
          title: "등록금 및 행정등록비 납부",
          description: `등록금(DBA ${krw(dbaFacts.tuition)} / MBA ${krw(mbaFacts.tuition)})과 행정등록비 ${krw(fees.administrative)}를 납부합니다.`,
        },
        {
          title: "학기 시작 · LMS",
          description: "학기 시작 시 홈페이지 LMS 시스템을 이용합니다.",
        },
      ],
    },
    calendar: {
      title: "학사일정",
      description: "연간 3학기로 운영됩니다.",
      items: [
        { period: "2 ~ 4월", label: "1학기", type: "semester" },
        { period: "5월", label: "방학", type: "break" },
        { period: "6 ~ 8월", label: "2학기", type: "semester" },
        { period: "9월", label: "방학", type: "break" },
        { period: "10 ~ 12월", label: "3학기", type: "semester" },
        { period: "1월", label: "방학", type: "break" },
      ],
    },
  },

  // -------------------------------------------------------------------------
  faq: {
    intro: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문",
      description:
        "과정과 학위에 대해 자주 묻는 질문을 모았습니다.",
    },
    items: [
      {
        question: "수업은 온라인으로 진행되나요?",
        answer:
          "네. 호텔·외식·와인경영 전공 석·박사과정은 100% 온라인으로 진행됩니다. 학기 시작 시 홈페이지 LMS 시스템을 이용합니다.",
      },
      {
        question: "MBA 과정은 몇 학기인가요?",
        answer: `경영학석사(MBA) 과정은 ${mbaFacts.semesters}학기제이며 총 ${mbaFacts.totalCredits}학점(전공 ${mbaFacts.majorCredits}학점, 공통 ${mbaFacts.commonCredits}학점)을 취득합니다. 채플 ${mbaFacts.chapelCourses}과목은 학점과 별도입니다.`,
      },
      {
        question: "DBA 과정은 몇 학기인가요?",
        answer: `경영학박사(DBA) 과정은 ${dbaFacts.semesters}학기제이며 총 ${dbaFacts.totalCredits}학점(전공 ${dbaFacts.majorCredits}학점, 공통 ${dbaFacts.commonCredits}학점)을 취득합니다. 채플 ${dbaFacts.chapelCourses}과목은 학점과 별도이며, ${dbaFacts.thesisSemester}학기는 논문학기로 운영됩니다.`,
      },
      {
        question: "한 학기에 몇 과목을 수강하나요?",
        answer: `석사·박사과정 모두 학기 당 ${mbaFacts.coursesPerSemester}과목 ${mbaFacts.creditsPerSemester}학점을 수강합니다.`,
      },
      {
        question: "학기는 언제 시작하나요?",
        answer:
          "1학기는 2~4월, 2학기는 6~8월, 3학기는 10~12월에 진행되며 5월, 9월, 1월은 방학입니다.",
      },
      {
        question: "교과목은 변경될 수 있나요?",
        answer: "교과목은 학기 사정에 따라 변경될 수 있습니다.",
      },
      {
        question: "외국 박사학위 신고제도란 무엇인가요?",
        answer:
          "고등교육법 제27조에 의거하여 외국에서 박사학위를 취득한 사람이 학위취득 사실을 '외국 박사학위 신고' 시스템에 등록하는 제도입니다. 외국에서 박사학위를 취득한 한국인의 현황 파악과 학위논문 공개를 통한 국가인적자원 활용 기초 자료 수집이 목적이며, 학위의 진위 여부를 확인하는 제도는 아닙니다.",
      },
      {
        question: "FICB 국제 와인기사작위는 무엇인가요?",
        answer:
          "우수한 수료자에게는 FICB(세계와인기사단총연합)의 국제 와인기사작위를 받을 수 있는 기회가 제공됩니다.",
      },
    ],
    note: "여기에 없는 내용은 입학상담을 통해 문의해 주세요.",
  },

  // -------------------------------------------------------------------------
  consultation: {
    intro: {
      eyebrow: "입학상담",
      title: "입학상담 신청",
      description:
        "과정 선택, 지원 자격, 등록 절차에 대해 궁금한 점을 남겨 주시면 확인 후 연락드립니다.",
    },
    guide: {
      title: "상담 안내",
      description:
        "아래 내용을 참고해 신청해 주시면 더 정확한 안내를 드릴 수 있습니다.",
      items: [
        {
          title: "무엇을 물어보면 되나요",
          description:
            "과정 선택, 수업 방식, 교육과정, 졸업요건, 등록금, 입학 절차 등 어떤 내용이든 좋습니다.",
        },
        {
          title: "어떻게 답변드리나요",
          description:
            "남겨 주신 연락처와 이메일로 답변드립니다. 두 가지 모두 정확하게 적어 주세요.",
        },
        {
          title: "언제 연락드리나요",
          description:
            "확인 후 순차적으로 연락드립니다. 답변 소요 기간은 확정되는 대로 이 영역에 안내합니다.",
        },
      ],
    },
    channelNotice: {
      title: "전화상담 · 카카오톡 상담",
      body: "대표 전화번호와 상담 채널은 현재 확정 중입니다. 준비되는 대로 이 영역에 안내하며, 그전까지는 아래 온라인 상담신청을 이용해 주세요.",
    },
    form: {
      title: "상담신청",
      description: "표시된 항목은 모두 입력해 주세요.",
      fields: {
        name: { label: "이름", placeholder: "홍길동" },
        phone: {
          label: "연락처",
          placeholder: "010-0000-0000",
          hint: "숫자와 -, +, ( ) 만 사용할 수 있습니다. 해외 번호는 국가번호를 포함해 주세요.",
        },
        email: { label: "이메일", placeholder: "name@example.com" },
        interestedProgram: {
          label: "관심 과정",
          placeholder: "선택해 주세요",
          options: [
            { value: "MBA", label: "MBA (석사과정)" },
            { value: "DBA", label: "DBA (박사과정)" },
          ],
        },
        message: {
          label: "문의내용",
          placeholder: "궁금한 점을 자유롭게 적어 주세요.",
        },
      },
      text: {
        requiredMark: "필수",
        optionalMark: "선택",
        submit: "상담 신청하기",
        submitting: "제출 중…",
        privacy: {
          label: "개인정보 수집 및 이용에 동의합니다.",
          summary:
            "수집 항목: 이름, 연락처, 이메일, 관심 과정, 문의내용 / 이용 목적: 입학상담 답변",
          pendingNotice:
            "개인정보 처리방침 전문과 보관 기간은 현재 준비 중입니다. 확정되는 대로 이 영역에서 확인하실 수 있습니다.",
        },
        invalidAlert: "입력하신 내용을 다시 확인해 주세요.",
        serverError:
          "상담 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        success: {
          title: "상담 신청이 접수되었습니다.",
          description: "확인 후 연락드리겠습니다.",
        },
        errors: {
          nameRequired: "이름을 입력해 주세요.",
          nameTooLong: "이름이 너무 깁니다.",
          phoneRequired: "연락처를 입력해 주세요.",
          phoneInvalid: "연락처 형식을 다시 확인해 주세요.",
          emailRequired: "이메일을 입력해 주세요.",
          emailInvalid: "유효한 이메일 주소를 입력해 주세요.",
          emailTooLong: "이메일이 너무 깁니다.",
          privacyRequired: "개인정보 수집에 동의해 주세요.",
          programRequired: "관심 과정을 선택해 주세요.",
          messageRequired: "문의내용을 입력해 주세요.",
          messageTooShort: "문의내용을 조금 더 자세히 적어 주세요.",
          messageTooLong: "문의내용이 너무 깁니다.",
        },
      },
      successLinks: [
        { path: "/admission", label: "입학안내 보기" },
        { path: "/programs", label: "MBA · DBA 과정 보기" },
      ],
    },
    seminarLink: {
      title: "설명회 신청",
      description:
        "과정 설명회 참석을 희망하시면 별도로 신청하실 수 있습니다. 일정이 확정되면 신청하신 분께 먼저 안내드립니다.",
      cta: "설명회 신청하기",
    },
  },

  // -------------------------------------------------------------------------
  seminar: {
    intro: {
      eyebrow: "입학상담",
      title: "설명회 신청",
      description:
        "과정 설명회 참석을 미리 신청하실 수 있습니다. 일정이 확정되면 신청하신 분께 먼저 안내드립니다.",
    },
    scheduleNotice: {
      title: "설명회 일정 안내",
      body: "확정된 설명회 일정이 아직 없습니다. 지금 신청해 두시면 일정이 확정되는 대로 남겨 주신 연락처로 안내드립니다.",
    },
    form: {
      title: "설명회 신청",
      description: "표시된 항목은 모두 입력해 주세요.",
      fields: {
        name: { label: "이름", placeholder: "홍길동" },
        phone: {
          label: "연락처",
          placeholder: "010-0000-0000",
          hint: "숫자와 -, +, ( ) 만 사용할 수 있습니다. 해외 번호는 국가번호를 포함해 주세요.",
        },
        email: { label: "이메일", placeholder: "name@example.com" },
        preferredSession: {
          label: "참석 희망 설명회",
          placeholder: "예: 평일 저녁 온라인 설명회 희망",
          hint: "확정된 일정이 없어 자유롭게 적어 주시면 됩니다. 희망하시는 시기나 방식을 적어 주세요.",
        },
        attendeeCount: {
          label: "참석 인원",
          hint: "1명부터 10명까지 신청하실 수 있습니다.",
        },
        memo: {
          label: "메모",
          placeholder: "미리 알고 싶은 내용이 있으면 적어 주세요.",
        },
      },
      text: {
        requiredMark: "필수",
        optionalMark: "선택",
        submit: "설명회 신청하기",
        submitting: "제출 중…",
        privacy: {
          label: "개인정보 수집 및 이용에 동의합니다.",
          summary:
            "수집 항목: 이름, 연락처, 이메일, 참석 희망 설명회, 참석 인원, 메모 / 이용 목적: 설명회 일정 안내",
          pendingNotice:
            "개인정보 처리방침 전문과 보관 기간은 현재 준비 중입니다. 확정되는 대로 이 영역에서 확인하실 수 있습니다.",
        },
        invalidAlert: "입력하신 내용을 다시 확인해 주세요.",
        serverError:
          "설명회 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        success: {
          title: "설명회 신청이 접수되었습니다.",
          description: "일정이 확정되면 남겨 주신 연락처로 안내드리겠습니다.",
        },
        errors: {
          nameRequired: "이름을 입력해 주세요.",
          nameTooLong: "이름이 너무 깁니다.",
          phoneRequired: "연락처를 입력해 주세요.",
          phoneInvalid: "연락처 형식을 다시 확인해 주세요.",
          emailRequired: "이메일을 입력해 주세요.",
          emailInvalid: "유효한 이메일 주소를 입력해 주세요.",
          emailTooLong: "이메일이 너무 깁니다.",
          privacyRequired: "개인정보 수집에 동의해 주세요.",
          sessionTooLong: "참석 희망 설명회 내용이 너무 깁니다.",
          attendeeCountInvalid: "참석 인원은 1명에서 10명 사이로 입력해 주세요.",
          memoTooLong: "메모가 너무 깁니다.",
        },
      },
      successLinks: [
        { path: "/consultation", label: "입학상담 신청하기" },
        { path: "/admission", label: "입학안내 보기" },
      ],
    },
    consultationLink: {
      title: "입학상담",
      description:
        "설명회를 기다리지 않고 바로 문의하고 싶으시면 입학상담을 이용해 주세요.",
      cta: "입학상담 신청하기",
    },
  },

  // -------------------------------------------------------------------------
  related: {
    title: "함께 보기",
    about: "대학원 소개",
    admission: "입학안내",
    consultation: "입학상담 신청",
    seminar: "설명회 신청",
    programs: "MBA · DBA 과정",
    mba: "MBA 과정",
    dba: "DBA 과정",
    degree: "학위 및 인증",
    faq: "FAQ",
    faculty: "교수진",
  },
};
