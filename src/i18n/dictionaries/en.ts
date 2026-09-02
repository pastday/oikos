import type { Dictionary } from "./ko";

/**
 * 영어 UI 문자열.
 *
 * 자동 번역이 아니라 영어권 사용자가 자연스럽게 읽을 수 있는 표현을 직접 작성한다.
 * 타입을 Dictionary 로 고정했으므로 한국어 사전에 키가 추가되면 여기서도 컴파일 오류로 알 수 있다.
 */
export const en: Dictionary = {
  site: {
    name: "Oikos University Graduate School of Business",
    wordmark: "OIKOS UNIVERSITY",
    wordmarkSub: "Graduate School of Business",
  },

  nav: {
    home: "HOME",
    about: "Graduate School",
    faculty: "Faculty",
    news: "News",
    resources: "Resources",
    programs: "MBA · DBA Programs",
    degree: "Degree & Accreditation",
    admission: "Admissions",
    consultation: "Consultation",
  },

  header: {
    cta: "Request Consultation",
    primaryNavLabel: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mobileMenuLabel: "Mobile menu",
    languageLabel: "Select language",
    skipToContent: "Skip to main content",
    logoAlt: "Oikos University logo",
  },

  home: {
    eyebrow: "OIKOS UNIVERSITY",
    title: "Oikos University Graduate School of Business",
    subtitle: "Hotel · Foodservice · Wine Management",
    degrees: "MBA · DBA",
    ctaPrograms: "Explore Programs",
    ctaConsultation: "Request Consultation",
  },

  footer: {
    description:
      "Oikos University Graduate School of Business, Hotel · Foodservice · Wine Management",
    quickLinks: "Quick Links",
    externalLinks: "External Links",
    externalLinkPending: "Link coming soon",
    copyright: "Oikos University. All rights reserved.",
  },

  news: {
    title: "News",
    description: "Latest news and updates from OIKOS University.",
    empty: "No news has been posted yet.",
    backToList: "Back to list",
    categoryLabel: "Category",
    publishedLabel: "Published",
    attachmentsTitle: "Attachments",
    downloadLabel: "Download",
    newWindow: "opens in a new window",
    relatedArticlesTitle: "Related Articles",
    videosTitle: "Videos",
    viewArticle: "View Article",
    watchVideo: "Watch Video",
  },

  resources: {
    title: "Resources",
    description:
      "Download admission forms, academic materials, and other OIKOS University resources.",
    empty: "No resources have been posted yet.",
    backToList: "Back to list",
    publishedLabel: "Posted",
    attachmentsTitle: "Attachments",
    downloadLabel: "Download",
    viewDetail: "View details",
    fileCountLabel: "{count} files",
    newWindow: "opens in a new window",
    admissionSectionTitle: "Admission Forms & Downloads",
    viewAll: "View all resources",
  },

  pages: {
    about: {
      title: "Graduate School",
      placeholder: "Graduate school content will be displayed here.",
    },
    faculty: {
      title: "Faculty",
      placeholder: "Faculty content will be displayed here.",
    },
    programs: {
      title: "MBA · DBA Programs",
      placeholder: "MBA and DBA program content will be displayed here.",
    },
    mba: {
      title: "MBA Program",
      placeholder: "MBA program content will be displayed here.",
    },
    dba: {
      title: "DBA Program",
      placeholder: "DBA program content will be displayed here.",
    },
    degree: {
      title: "Degree & Accreditation",
      placeholder: "Degree and accreditation content will be displayed here.",
    },
    admission: {
      title: "Admissions",
      placeholder: "Admissions content will be displayed here.",
    },
    consultation: {
      title: "Consultation",
      placeholder: "Consultation content will be displayed here.",
    },
    faq: {
      title: "FAQ",
      placeholder: "Frequently asked questions will be displayed here.",
    },
  },

  devNotice:
    "This page is under development. Actual content will be added in a later stage.",

  meta: {
    homeTitle: "Oikos University Graduate School | MBA & DBA",
    homeDescription:
      "MBA and DBA programs in Hotel, Foodservice and Wine Management at Oikos University Graduate School of Business. 100% online, 4 semesters for the MBA and 6 for the DBA, starting October 2026.",
    titleSuffix: "Oikos University Graduate School",
    pageDescription:
      "Hotel, Foodservice and Wine Management at Oikos University Graduate School of Business.",
  },
};
