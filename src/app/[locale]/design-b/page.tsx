import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BConsultationCTA } from "@/components/site-b/BConsultationCTA";
import { BHero } from "@/components/site-b/BHero";
import { BAdmissionBand } from "@/components/site-b/home/BAdmissionBand";
import { BCurriculum } from "@/components/site-b/home/BCurriculum";
import { BDegreeStrip } from "@/components/site-b/home/BDegreeStrip";
import { BFacultyHome } from "@/components/site-b/home/BFacultyHome";
import { BIntro } from "@/components/site-b/home/BIntro";
import { BOnline } from "@/components/site-b/home/BOnline";
import { BPrograms } from "@/components/site-b/home/BPrograms";
import { BSpecialization } from "@/components/site-b/home/BSpecialization";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getHomeContent } from "@/content/home";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import {
  getChiefProfessor,
  getHomeCoursePreview,
  getProgramNumbers,
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
 * 관리자가 CMS 에서 무엇을 고치든 A안과 B안에 똑같이 반영된다.
 *
 * ## 섹션의 성격을 일부러 다르게 둔다
 *
 * A안은 "제목 + 카드 격자"가 아홉 번 반복된다. 무엇이 중요한지 알 수 없다.
 * B안은 섹션마다 다른 배치를 쓴다.
 *
 *   Hero          좌우 분할 + 비주얼 자리
 *   대학원 소개    선언문 + 2단 본문
 *   전공 영역      비주얼 + 번호 목록
 *   MBA · DBA     밝은 판 / 어두운 판의 어긋난 대비 쌍
 *   100% ONLINE   화면을 가로지르는 큰 글자
 *   교육과정       머무는 제목 + 번호 목록
 *   교수진         세로로 긴 인물 자리
 *   학위 · 인증    한 줄짜리 가로 띠
 *   입학안내       개강 시점을 가장 크게
 *   상담           화면 전체를 쓰는 마무리
 */
export default async function DesignBHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const content = getHomeContent(locale);
  const [programs, chief, courses, numbers] = await Promise.all([
    getPublishedPrograms(locale),
    getChiefProfessor(locale),
    getHomeCoursePreview(locale),
    getProgramNumbers(),
  ]);

  const pages = getPageContent(locale, numbers);
  const watermark = dict.site.wordmark;

  return (
    <>
      {/* Hero 배경 이미지는 아직 없다. Media 가 생기면 backgroundMedia 로 넘긴다. */}
      <BHero locale={locale} content={content} watermark={watermark} />

      <BIntro content={content} />
      <BSpecialization content={content} watermark={watermark} />
      <BPrograms
        locale={locale}
        content={content}
        programs={programs}
        watermark={watermark}
      />
      <BOnline content={content} watermark={watermark} />
      <BCurriculum locale={locale} content={content} courses={courses} />
      <BFacultyHome
        locale={locale}
        content={content}
        facultyLabels={pages.faculty.labels}
        chief={chief}
        watermark={watermark}
      />
      <BDegreeStrip locale={locale} content={content} />
      <BAdmissionBand locale={locale} content={content} />

      <BConsultationCTA
        locale={locale}
        eyebrow={dict.nav.consultation}
        title={content.consultation.title}
        description={content.consultation.description}
        cta={content.consultation.cta}
      />
    </>
  );
}
