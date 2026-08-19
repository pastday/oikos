import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccordionB } from "@/components/site-b/AccordionB";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import { SectionB } from "@/components/site-b/SectionB";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { toPageIntro } from "@/lib/cms/page-view";
import {
  getPageSections,
  getProgramNumbers,
  getPublishedFaqs,
} from "@/lib/cms/queries";

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

  return buildDesignBMetadata({
    title: intro.title,
    description: intro.description,
  });
}

/**
 * B안 FAQ.
 *
 * 질문·답변은 DB(`FAQ`)에서 오고 공개 여부·정렬 규칙은 A안과 같다.
 * **데이터를 복제하지 않는다.** 관리자가 CMS 에서 고치면 두 안에 함께 반영된다.
 * 공개된 항목이 하나도 없으면 목록 영역을 그리지 않는다. 페이지는 깨지지 않는다.
 */
export default async function DesignBFaqPage({ params }: PageProps) {
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
      <PageHeroB intro={toPageIntro(intro, pages.faq.intro)} />

      {(faqs.length > 0 || intro?.note) && (
        <SectionB>
          <div className="max-w-4xl">
            {faqs.length > 0 && (
              <AccordionB
                items={faqs.map((item) => ({
                  id: `faq-${item.id}`,
                  title: item.question,
                  content: (
                    <p className="max-w-3xl whitespace-pre-line">
                      {item.answer}
                    </p>
                  ),
                }))}
              />
            )}

            {intro?.note && (
              <p className="mt-10 text-sm text-quiet">{intro.note}</p>
            )}
          </div>
        </SectionB>
      )}

      <RelatedLinksB
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
