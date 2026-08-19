import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/page/ProgramPage";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { getPageContent } from "@/content/pages";
import {
  getProgramCurriculum,
  getProgramNumbers,
  getPublishedProgram,
} from "@/lib/cms/queries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/programs/dba";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).dba;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * DBA 과정 상세.
 *
 * 과정 수치와 교육과정은 DB 에서 읽는다.
 * 관리자가 과정을 **비공개로 바꾸면 이 페이지는 404** 가 된다.
 * 비공개인데 상세 화면만 살아 있으면 방문자에게 혼란스럽기 때문이다.
 */
export default async function DBAPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const program = await getPublishedProgram("DBA", locale);
  if (!program) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const curriculum = await getProgramCurriculum(program.id, locale);

  return (
    <>
      <ProgramPage content={pages.dba} curriculum={curriculum} />
      <RelatedLinks
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
