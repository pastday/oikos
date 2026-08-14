/**
 * 교과목 카탈로그 타입.
 *
 * 출처: docs/source/대학원 및 전공 소개.odt 의 교과목 편성표와 전공과목 소개.
 * 원본에 값이 없는 항목(학점 표기 누락, 교과 내용 없음)은 null 로 둔다. 임의로 채우지 않는다.
 * 이후 단계에서 Course 테이블로 옮긴다.
 */
export const courseKeys = [
  "global-tourism-structure",
  "wine-culture-history",
  "hospitality-service-systems",
  "wine-brand-destination",
  "global-festivals-events",
  "gastronomic-wine-tourism",
  "mice-conventions",
  "sustainable-wine-tourism",
  "global-hotel-food-culture",
  "world-wineries",
  "global-travel-trends",
  "wine-civilization",
  "global-tourism-culture",
  "hotel-resort-culture",
  "gastronomy-wine-symbolism",
  "hospitality-industry",
  "tourism-marketing",
  "hotel-consumer-behavior",
  "foodservice-industry",
  "wine-and-food",
] as const;

export type CourseKey = (typeof courseKeys)[number];

export type CourseCategory = "major" | "common";

export type Course = {
  key: CourseKey;
  category: CourseCategory;
  /** 해당 locale 에서 앞에 표시할 과목명 */
  title: string;
  /** 함께 보여줄 다른 언어 과목명 */
  titleAlt: string;
  /** 원본에 학점 표기가 없는 과목은 null */
  credits: number | null;
  /** 원본 표기: 이론 */
  format: string;
  /** 원본 교과 내용. 원본에 없거나 다른 과목과 중복 기재된 경우 null */
  description: string | null;
  /**
   * 원본 문서에 영문 과목명이 두 가지로 기재된 경우 모두 보존한다.
   * 어느 쪽이 공식인지 임의로 단정하지 않는다.
   */
  altEnglishTitles?: string[];
};

export type CourseCatalog = Record<CourseKey, Course>;
