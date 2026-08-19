import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdmissionPreview } from "@/components/home/AdmissionPreview";
import { ConsultationCTA } from "@/components/home/ConsultationCTA";
import { CurriculumPreview } from "@/components/home/CurriculumPreview";
import { DegreePreview } from "@/components/home/DegreePreview";
import { FacultyPreview } from "@/components/home/FacultyPreview";
import { HeroSection } from "@/components/home/HeroSection";
import { MajorIntro } from "@/components/home/MajorIntro";
import { OnlineSection } from "@/components/home/OnlineSection";
import { ProgramCards } from "@/components/home/ProgramCards";
import { getHomeContent } from "@/content/home";
import {
  getChiefProfessor,
  getHomeCoursePreview,
  getPublishedPrograms,
} from "@/lib/cms/queries";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "",
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  });
}

/**
 * 메인 페이지.
 *
 * 섹션 순서는 홈피구성안의 HOME 스크롤 순서를 따른다.
 *
 * 문구는 `src/content/home` 에, **과정·교수진·교과목 데이터는 DB** 에 있다.
 * 관리자가 CMS 에서 고치면 이 화면에도 반영된다.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getHomeContent(locale);
  const [programs, chief, courses] = await Promise.all([
    getPublishedPrograms(locale),
    getChiefProfessor(locale),
    getHomeCoursePreview(locale),
  ]);

  return (
    <>
      <HeroSection locale={locale} content={content} />
      <MajorIntro content={content} />
      <ProgramCards content={content} programs={programs} />
      <OnlineSection content={content} />
      <CurriculumPreview locale={locale} content={content} courses={courses} />
      <FacultyPreview locale={locale} content={content} chief={chief} />
      <DegreePreview locale={locale} content={content} />
      <AdmissionPreview locale={locale} content={content} />
      <ConsultationCTA locale={locale} content={content} />
    </>
  );
}
