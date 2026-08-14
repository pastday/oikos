import type { CourseKey } from "./types";

/**
 * 과정별 교육과정 편성. 언어와 무관한 구조이므로 여기에서만 정의한다.
 *
 * 출처: docs/source/대학원 및 전공 소개.odt 의 석사·박사 커리큘럼.
 *
 * 원본 불일치에 대한 처리 (임의로 해결하지 않는다)
 *  - 석사 전공: 원본에 "총 24학점: 8 EA 과목" 이라 적혀 있으나 실제로는 10과목이 나열되어 있다.
 *  - 박사 전공: 원본에 "총 30학점: 10 EA 과목" 이라 적혀 있으나 실제로는 14과목이 나열되어 있다.
 *  → 학기차가 명시된 과목만 `bySemester` 로 두고,
 *    학기차 없이 나열된 나머지는 `additionalMajor` 로 분리한다.
 *    화면에서도 "필수 N과목" 처럼 단정하지 않는다.
 */

export type SemesterGroup = {
  semester: number;
  courseKeys: CourseKey[];
};

export type Curriculum = {
  /** 원본에 학기차가 명시된 전공과목 */
  bySemester: SemesterGroup[];
  /** 원본 목록에 있으나 학기차가 명시되지 않은 전공과목 */
  additionalMajor: CourseKey[];
  /** 공통과목 (경영학 관련) */
  common: CourseKey[];
};

export const mbaCurriculum: Curriculum = {
  bySemester: [
    {
      semester: 1,
      courseKeys: ["global-tourism-structure", "wine-culture-history"],
    },
    {
      semester: 2,
      courseKeys: ["hospitality-service-systems", "wine-brand-destination"],
    },
    {
      semester: 3,
      courseKeys: ["global-festivals-events", "gastronomic-wine-tourism"],
    },
    {
      semester: 4,
      courseKeys: ["mice-conventions", "sustainable-wine-tourism"],
    },
  ],
  additionalMajor: ["global-travel-trends", "wine-civilization"],
  common: [
    "hospitality-industry",
    "tourism-marketing",
    "hotel-consumer-behavior",
    "foodservice-industry",
  ],
};

export const dbaCurriculum: Curriculum = {
  bySemester: [
    {
      semester: 1,
      courseKeys: ["global-tourism-structure", "wine-culture-history"],
    },
    {
      semester: 2,
      courseKeys: ["hospitality-service-systems", "wine-brand-destination"],
    },
    {
      semester: 3,
      courseKeys: ["global-festivals-events", "gastronomic-wine-tourism"],
    },
    {
      semester: 4,
      courseKeys: ["mice-conventions", "sustainable-wine-tourism"],
    },
    {
      semester: 5,
      courseKeys: ["global-hotel-food-culture", "world-wineries"],
    },
  ],
  additionalMajor: [
    "global-travel-trends",
    "wine-civilization",
    "global-tourism-culture",
    "hotel-resort-culture",
  ],
  common: [
    "hospitality-industry",
    "tourism-marketing",
    "hotel-consumer-behavior",
    "foodservice-industry",
    "wine-and-food",
  ],
};
