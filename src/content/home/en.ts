import { formatIntake } from "../program-facts";
import type { HomeContent } from "./types";

const intakeEn = formatIntake("en");

/**
 * 영어 메인 페이지 콘텐츠.
 *
 * 한국어를 기계적으로 직역하지 않고, 원본 자료의 영어 표현을 우선 사용한다.
 *  - 전공 영문명 / 교과목 영문명 : 대학원 및 전공 소개.odt 표기를 그대로 사용
 *  - 학교·학위 명칭에 원본에 없는 표현을 새로 만들지 않는다.
 */
export const homeEn: HomeContent = {
  hero: {
    eyebrow: "USA OIKOS UNIVERSITY",
    university: "Oikos University",
    title: "Graduate School of Business",
    major: "Hotel · Foodservice · Wine Management",
    degrees: "MBA · DBA",
    online: "100% Online Programs",
    ctaPrograms: "Explore Programs",
    ctaConsultation: "Request Consultation",
    logoAlt: "Oikos University logo",
  },

  facts: [
    { label: "Master's (MBA)", value: "4 Semesters" },
    { label: "Doctorate (DBA)", value: "6 Semesters" },
    { label: "Starts", value: intakeEn },
    { label: "Chief Professor", value: "Dong-Joon Kim" },
  ],

  major: {
    eyebrow: "The Major",
    title: "Hotel, Foodservice & Wine Management",
    paragraphs: [
      "Hotel, Foodservice and Wine Management is an interdisciplinary major that brings these three fields together. Grounded in business theory, it provides advanced practical training in tourism industry management.",
      "Students build expertise across hotel management, wine and foodservice, and the wider tourism industry, with coursework on strengthening professional capability, brand differentiation, and hotel and tourism marketing that can be applied in practice.",
      "The program centers on learning, practising and researching hotel, foodservice and wine management as the core of a customer-centered service culture.",
    ],
    ficbNote:
      "Outstanding graduates may be given the opportunity to receive an international wine knighthood from FICB (Fédération Internationale des Confréries Bachiques).",
  },

  pillars: {
    title: "Four Core Areas",
    description:
      "The curriculum is designed to cover the convergence of the tourism industry's key fields.",
    items: [
      {
        key: "hotel",
        title: "Hotel Management",
        description:
          "Service structures and operations of hotels and resorts, and how guest experience is designed.",
      },
      {
        key: "foodservice",
        title: "Foodservice",
        description:
          "The structure and operating characteristics of the foodservice industry, market change and management strategy.",
      },
      {
        key: "wine",
        title: "Wine Management",
        description:
          "Global wine culture and history, and how wine brands and the wine industry are formed.",
      },
      {
        key: "tourism",
        title: "Tourism & Hospitality",
        description:
          "The structure of the global tourism industry, MICE, festivals and events, and tourism marketing.",
      },
    ],
  },

  programs: {
    eyebrow: "Degree Programs",
    title: "MBA · DBA Programs",
    description:
      "Professional degree programs designed for working practitioners who study alongside their careers.",
    labels: {
      duration: "Semesters",
      credits: "Total credits",
      breakdownTemplate: "{major} major · {common} common",
      chapelTemplate: "{n} chapel courses (separate)",
    },
    items: [
      {
        code: "MBA",
        tagline: "A master's program centered on theory coursework",
        href: "/en/programs/mba",
        cta: "View the MBA",
      },
      {
        code: "DBA",
        tagline: "A professional doctoral program",
        note: "Semester 6 is the dissertation semester",
        href: "/en/programs/dba",
        cta: "View the DBA",
      },
    ],
  },

  online: {
    badge: "100% ONLINE",
    title: "A graduate business program delivered fully online",
    description:
      "An online graduate program opened for working professionals who pursue a degree alongside their careers.",
    scheduleTitle: "Academic Semesters",
    schedule: [
      "Semester 1 · February – April",
      "Semester 2 · June – August",
      "Semester 3 · October – December",
      "Breaks · May, September, January",
    ],
  },

  curriculum: {
    eyebrow: "Curriculum",
    title: "Selected Courses",
    description:
      "Theory courses spanning hotels, foodservice, wine and the tourism industry.",
    note: "Courses may change depending on semester circumstances.",
    cta: "View full curriculum",
  },

  faculty: {
    eyebrow: "Faculty",
    title: "Chief Professor",
    description: "The chief professor overseeing the major's curriculum.",
    cta: "Meet the Faculty",
  },

  degree: {
    eyebrow: "Degree & Accreditation",
    title: "Review our degree and accreditation information",
    description:
      "Details on Oikos University's approvals and its degree programs.",
    cta: "Learn about degrees & accreditation",
  },

  admission: {
    eyebrow: "Admissions",
    title: `Starting ${intakeEn}`,
    description:
      "Review the admissions guide and application process.",
    items: [
      { label: "MBA", value: "4 semesters" },
      { label: "DBA", value: "6 semesters" },
      { label: "Format", value: "100% online" },
      { label: "Starts", value: intakeEn },
    ],
    ctaGuide: "View admissions guide",
    ctaConsultation: "Request Consultation",
  },

  consultation: {
    title: "Considering Graduate Study?",
    description:
      "Learn more about our MBA and DBA programs and admissions process.",
    cta: "Request Consultation",
  },
};
