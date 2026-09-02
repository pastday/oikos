/**
 * 한국어 UI 문자열.
 *
 * 여기에는 메뉴·버튼·라벨 같은 **공통 UI 텍스트**만 둔다.
 * 대학원 소개문, 교수 정보 같은 **실제 콘텐츠**는 이후 단계에서 DB(PageSection 등)로 관리한다.
 * 이 파일이 영어 사전의 타입 기준이 된다.
 */
export const ko = {
  site: {
    name: "오이코스대학교 경영대학원",
    wordmark: "OIKOS UNIVERSITY",
    wordmarkSub: "경영대학원",
  },

  nav: {
    home: "HOME",
    about: "대학원 소개",
    faculty: "교수진",
    news: "학교소식",
    programs: "MBA · DBA 과정",
    degree: "학위 및 인증",
    admission: "입학안내",
    consultation: "입학상담",
  },

  header: {
    cta: "입학상담 신청",
    primaryNavLabel: "주요 메뉴",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    mobileMenuLabel: "모바일 메뉴",
    languageLabel: "언어 선택",
    skipToContent: "본문으로 건너뛰기",
    logoAlt: "오이코스대학교 로고",
  },

  home: {
    eyebrow: "OIKOS UNIVERSITY",
    title: "미국 오이코스대학교 경영대학원",
    subtitle: "호텔 · 외식 · 와인경영 전공",
    degrees: "MBA · DBA",
    ctaPrograms: "과정 알아보기",
    ctaConsultation: "입학상담 신청",
  },

  footer: {
    description: "미국 오이코스대학교 경영대학원 호텔·외식·와인경영 전공",
    quickLinks: "바로가기",
    externalLinks: "관련 사이트",
    externalLinkPending: "링크 준비중",
    copyright: "Oikos University. All rights reserved.",
  },

  /**
   * 학교소식 목록·상세 UI 문구.
   *
   * 목록 상단 문구는 고정값이라 CMS 로 관리하지 않고 여기 둔다.
   * (교수진·FAQ 의 intro 는 PageSection 이지만 학교소식은 상단 레이아웃이 단순하다)
   * 게시물 제목·요약·본문 같은 실제 콘텐츠는 DB(`NewsPost`)에서 온다.
   */
  news: {
    title: "학교소식",
    description: "OIKOS UNIVERSITY의 새로운 소식을 전합니다.",
    empty: "등록된 학교소식이 없습니다.",
    backToList: "목록으로",
    categoryLabel: "카테고리",
    publishedLabel: "게시일",
    attachmentsTitle: "첨부파일",
    downloadLabel: "다운로드",
    newWindow: "새 창에서 열림",
  },

  pages: {
    about: {
      title: "대학원 소개",
      placeholder: "대학원 소개 콘텐츠가 이 영역에 표시됩니다.",
    },
    faculty: {
      title: "교수진",
      placeholder: "교수진 콘텐츠가 이 영역에 표시됩니다.",
    },
    programs: {
      title: "MBA · DBA 과정",
      placeholder: "MBA · DBA 과정 콘텐츠가 이 영역에 표시됩니다.",
    },
    mba: {
      title: "MBA 소개",
      placeholder: "MBA 과정 콘텐츠가 이 영역에 표시됩니다.",
    },
    dba: {
      title: "DBA 소개",
      placeholder: "DBA 과정 콘텐츠가 이 영역에 표시됩니다.",
    },
    degree: {
      title: "학위 및 인증",
      placeholder: "학위 및 인증 콘텐츠가 이 영역에 표시됩니다.",
    },
    admission: {
      title: "입학안내",
      placeholder: "입학안내 콘텐츠가 이 영역에 표시됩니다.",
    },
    consultation: {
      title: "입학상담",
      placeholder: "입학상담 콘텐츠가 이 영역에 표시됩니다.",
    },
    faq: {
      title: "FAQ",
      placeholder: "자주 묻는 질문이 이 영역에 표시됩니다.",
    },
  },

  /** 개발 중 골격 페이지임을 알리는 안내. 실제 콘텐츠 작업 시 제거한다. */
  devNotice: "개발 중인 페이지입니다. 실제 콘텐츠는 이후 단계에서 추가됩니다.",

  meta: {
    homeTitle: "오이코스대학교 경영대학원 | 호텔·외식·와인경영 MBA·DBA",
    homeDescription:
      "미국 오이코스대학교 경영대학원 호텔·외식·와인경영 전공의 MBA·DBA 과정 안내. 100% 온라인 과정, 석사 4학기·박사 6학기, 2026년 10월 개강. 교육과정과 입학안내를 확인하세요.",
    titleSuffix: "오이코스대학교 경영대학원",
    pageDescription:
      "미국 오이코스대학교 경영대학원 호텔·외식·와인경영 전공 안내.",
  },
};

export type Dictionary = typeof ko;
