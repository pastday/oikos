import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BAccordion } from "@/components/site-b/BAccordion";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import { BHeadline } from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
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
 *
 * 조판은 다르다. A안은 좁은 폭(max-w-3xl)의 카드 안에 작은 글씨로 접어 둔다.
 * B안은 왼쪽에 제목이 머무는 2단 배치이고 질문이 세리프 큰 글자로 선다.
 * 공개된 항목이 하나도 없으면 목록 영역을 그리지 않는다.
 */
export default async function DesignBFaqPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers, faqs] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
    getPublishedFaqs(locale),
  ]);

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, numbers);
  const intro = sections.intro;
  const resolvedIntro = toPageIntro(intro, pages.faq.intro);

  return (
    <>
      <BPageHero
        intro={resolvedIntro}
        index={8}
        watermark={dict.site.wordmark}
      />

      {(faqs.length > 0 || intro?.note) && (
        <BSection index={1} label={resolvedIntro.title} tone="paper">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <BHeadline>{resolvedIntro.title}</BHeadline>
                {intro?.note && (
                  <p className="mt-8 max-w-md text-sm leading-[1.85] text-quiet">
                    {intro.note}
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-8">
              <BAccordion
                items={faqs.map((item) => ({
                  id: `faq-${item.id}`,
                  title: item.question,
                  content: (
                    <p className="max-w-[62ch] whitespace-pre-line">
                      {item.answer}
                    </p>
                  ),
                }))}
                numbered
              />
            </div>
          </div>
        </BSection>
      )}

      <BRelated
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
