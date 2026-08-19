import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdmissionB } from "@/components/site-b/home/AdmissionB";
import { ConsultationCtaB } from "@/components/site-b/home/ConsultationCtaB";
import { CurriculumB } from "@/components/site-b/home/CurriculumB";
import { DegreeB } from "@/components/site-b/home/DegreeB";
import { FacultyB } from "@/components/site-b/home/FacultyB";
import { HeroB } from "@/components/site-b/home/HeroB";
import { IntroB } from "@/components/site-b/home/IntroB";
import { OnlineB } from "@/components/site-b/home/OnlineB";
import { PillarsB } from "@/components/site-b/home/PillarsB";
import { ProgramsB } from "@/components/site-b/home/ProgramsB";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getHomeContent } from "@/content/home";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import {
  getChiefProfessor,
  getHomeCoursePreview,
  getPublishedPrograms,
} from "@/lib/cms/queries";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildDesignBMetadata({
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  });
}

/**
 * B안 메인 페이지.
 *
 * **A안 메인과 완전히 같은 데이터**를 같은 조회 함수로 읽는다.
 * (`getPublishedPrograms` / `getChiefProfessor` / `getHomeCoursePreview`)
 * 관리자가 CMS 에서 무엇을 고치든 A안과 B안에 똑같이 반영된다. (13단계 지시 26·31항)
 *
 * 섹션 순서는 지시 14항의 흐름을 따른다.
 * Hero → 대학원/전공 소개 → 전공 영역 → MBA/DBA → 100% ONLINE →
 * 교육과정 → 교수진 → 학위/인증 → 입학안내 → 상담 CTA
 */
export default async function DesignBHomePage({ params }: PageProps) {
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
      {/* Hero 배경 이미지는 아직 없다. Media 가 생기면 backgroundMedia 로 넘긴다. */}
      <HeroB locale={locale} content={content} />
      <IntroB content={content} />
      <PillarsB content={content} />
      <ProgramsB locale={locale} content={content} programs={programs} />
      <OnlineB content={content} />
      <CurriculumB locale={locale} content={content} courses={courses} />
      <FacultyB locale={locale} content={content} chief={chief} />
      <DegreeB locale={locale} content={content} />
      <AdmissionB locale={locale} content={content} />
      <ConsultationCtaB locale={locale} content={content} />
    </>
  );
}
