import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { ProgramPageB } from "@/components/site-b/ProgramPageB";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import {
  getProgramCurriculum,
  getProgramNumbers,
  getPublishedProgram,
} from "@/lib/cms/queries";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).dba;

  return buildDesignBMetadata({
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * B안 DBA 과정 상세.
 *
 * A안과 같은 조회를 하고 같은 규칙을 따른다.
 * 관리자가 과정을 **비공개로 바꾸면 여기서도 404** 다. 두 안의 동작이 갈라지지 않게 한다.
 */
export default async function DesignBDbaPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const program = await getPublishedProgram("DBA", locale);
  if (!program) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const curriculum = await getProgramCurriculum(program.id, locale);

  return (
    <>
      <ProgramPageB content={pages.dba} curriculum={curriculum} />
      <RelatedLinksB
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/programs/mba", label: pages.related.mba },
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
