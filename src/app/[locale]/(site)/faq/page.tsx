import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/page/Accordion";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import {
  getPageSections,
  getProgramNumbers,
  getPublishedFaqs,
} from "@/lib/cms/queries";
import { toPageIntro } from "@/lib/cms/page-view";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/faq";
const PAGE_KEY = "faq";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const intro = toPageIntro(
    sections.intro,
    getPageContent(locale, numbers).faq.intro,
  );

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: intro.title,
    description: intro.description,
  });
}

/**
 * FAQ 페이지.
 *
 * 10단계부터 질문·답변은 **DB(`FAQ`)가 출처**이며 관리자 CMS 에서 관리한다.
 * 상단 문구와 하단 안내는 `PageSection` 의 `faq/intro` 섹션에서 온다.
 * 공개된 항목이 하나도 없으면 목록 영역을 그리지 않는다. 페이지는 깨지지 않는다.
 */
export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers, faqs] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
    getPublishedFaqs(locale),
  ]);

  const pages = getPageContent(locale, numbers);
  const intro = sections.intro;

  return (
    <>
      <PageHero intro={toPageIntro(intro, pages.faq.intro)} />

      {(faqs.length > 0 || intro?.note) && (
        <Section>
          <div className="max-w-3xl">
            {faqs.length > 0 && (
              <Accordion
                items={faqs.map((item) => ({
                  id: `faq-${item.id}`,
                  title: item.question,
                  content: <p>{item.answer}</p>,
                }))}
              />
            )}

            {intro?.note && (
              <p className="mt-6 text-sm text-muted">{intro.note}</p>
            )}
          </div>
        </Section>
      )}

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
