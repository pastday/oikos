import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/page/Accordion";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { getProgramNumbers } from "@/lib/cms/queries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/faq";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).faq;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * FAQ 페이지.
 * 원본 자료에 독립된 FAQ 목록이 없으므로,
 * 원본 문서에서 명확하게 답할 수 있는 질문만 구성한다. 질문을 창작하지 않는다.
 */
export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.faq;

  return (
    <>
      <PageHero intro={content.intro} />

      <Section>
        <div className="max-w-3xl">
          <Accordion
            items={content.items.map((item, index) => ({
              id: `faq-${index}`,
              title: item.question,
              content: <p>{item.answer}</p>,
            }))}
          />

          <p className="mt-6 text-sm text-muted">{content.note}</p>
        </div>
      </Section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/degree", label: pages.related.degree },
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
