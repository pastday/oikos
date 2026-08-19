import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BProgramFeature } from "@/components/site-b/BProgramFeature";
import { BRelated } from "@/components/site-b/BRelated";
import {
  BBody,
  BHeadline,
  BPullQuote,
  BRule,
} from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
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
 * 두 과정 판은 메인과 **같은 컴포넌트**를 쓴다.
 * (두 화면에서 과정 소개가 갈라지지 않게 하려는 것이며 A안도 같은 데이터를 공유한다)
 * 전공 소개 본문은 메인과 같은 콘텐츠이고 여기서는 선언문 + 2단으로 조판한다.
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
  const [lead, ...rest] = home.major.paragraphs;

  return (
    <>
      <BPageHero
        intro={{
          eyebrow: home.programs.eyebrow,
          title: dict.pages.programs.title,
          description: home.programs.description,
        }}
        index={3}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={home.major.eyebrow} tone="paper">
        <BHeadline size="small">{home.major.title}</BHeadline>
        {lead && <BPullQuote className="mt-8">{lead}</BPullQuote>}
        <BRule className="my-12 lg:my-14" />
        <BBody paragraphs={rest} columns={2} />
        <p className="mt-12 max-w-[62ch] border-t border-rule pt-8 text-[0.9375rem] leading-[1.85] text-quiet">
          {home.major.ficbNote}
        </p>
      </BSection>

      {programs.length > 0 && (
        <BSection index={2} label={home.programs.title} tone="stone">
          <BHeadline>{home.programs.title}</BHeadline>
          <div className="mt-16">
            <BProgramFeature
              locale={locale}
              content={home}
              programs={programs}
            />
          </div>
        </BSection>
      )}

      <BRelated
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
