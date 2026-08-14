import type { Locale } from "@/i18n/config";
import { coursesEn } from "./en";
import { coursesKo } from "./ko";
import type { Course, CourseCatalog, CourseKey } from "./types";

const catalogs: Record<Locale, CourseCatalog> = {
  ko: coursesKo,
  en: coursesEn,
};

export function getCourseCatalog(locale: Locale): CourseCatalog {
  return catalogs[locale];
}

export function getCourses(locale: Locale, keys: readonly CourseKey[]): Course[] {
  const catalog = catalogs[locale];
  return keys.map((key) => catalog[key]);
}

export type { Course, CourseCatalog, CourseKey };
export { mbaCurriculum, dbaCurriculum } from "./curriculum";
export type { Curriculum, SemesterGroup } from "./curriculum";
