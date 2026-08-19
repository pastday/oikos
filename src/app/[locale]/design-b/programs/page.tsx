import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContainerB } from "@/components/site-b/ContainerB";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { ProgramPanelsB } from "@/components/site-b/ProgramPanelsB";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import { ProseB, PullQuoteB, SectionB, SectionHeadB } from "@/components/site-b/SectionB";
import { getHomeContent } from "@/content/home";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getProgramNumbers, getPublishedPrograms } from "@/lib/cms/queries";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildDesignBMetadata({
    title: dict.pages.programs.title,
    description: getHomeContent(locale).programs.description,
  });
}

/**
 * B안 MBA · DBA 과정 허브.
 *
 * A안과 같이 전공 소개와 두 과정 요약을 두고 각 상세로 보낸다.
 * 콘텐츠도 A안과 같은 것(메인과 공유하는 `HomeContent`)을 쓴다.
 */
export default async function DesignBProgramsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const home = getHomeContent(locale);
  const [programs, numbers] = await Promise.all([
    getPublishedPrograms(locale),
    getProgramNumbers(),
  ]);
  const pages = getPageContent(locale, numbers);

  return (
    <>
      <PageHeroB
        intro={{
          eyebrow: home.programs.eyebrow,
          title: dict.pages.programs.title,
          description: home.programs.description,
        }}
      />

      <SectionB>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeadB index={1} title={home.major.title} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ProseB paragraphs={home.major.paragraphs} />
            <div className="mt-10">
              <PullQuoteB>{home.major.ficbNote}</PullQuoteB>
            </div>
          </div>
        </div>
      </SectionB>

      {programs.length > 0 && (
        <section className="border-t border-rule bg-paper-2 py-20 lg:py-32">
          <ContainerB>
            <SectionHeadB index={2} title={home.programs.title} />
          </ContainerB>
          <ContainerB className="mt-14">
            <ProgramPanelsB
              locale={locale}
              content={home}
              programs={programs}
            />
          </ContainerB>
        </section>
      )}

      <RelatedLinksB
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/faculty", label: pages.related.faculty },
          { path: "/admission", label: pages.related.admission },
          {
            path: "/consultation",
            label: pages.related.consultation,
            primary: true,
          },
        ]}
      />
    </>
  );
}
