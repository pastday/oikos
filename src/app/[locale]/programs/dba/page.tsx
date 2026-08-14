import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/page/ProgramPage";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { dbaCurriculum } from "@/content/courses";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/programs/dba";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale).dba;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function DbaPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale);

  return (
    <>
      <ProgramPage
        locale={locale}
        content={pages.dba}
        curriculum={dbaCurriculum}
      />
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
