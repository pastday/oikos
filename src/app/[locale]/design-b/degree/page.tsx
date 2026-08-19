import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { ItemImageB } from "@/components/site-b/MediaBlocksB";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { bPath } from "@/components/site-b/paths";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import {
  ButtonB,
  ProseB,
  PullQuoteB,
  SectionB,
  SectionHeadB,
} from "@/components/site-b/SectionB";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { toPageIntro, toPairs } from "@/lib/cms/page-view";
import { getPageSections, getProgramNumbers } from "@/lib/cms/queries";
import { externalLinks } from "@/lib/site-links";

const PAGE_KEY = "degree";

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
    getPageContent(locale, numbers).degree.intro,
  );

  return buildDesignBMetadata({
    title: intro.title,
    description: intro.description,
  });
}

/**
 * B안 학위 및 인증.
 *
 * 인증 항목에 로고가 연결되어 있으면 로고를 쓰고, 없으면 글자만으로 카드를 만든다.
 * **BPPE·TRACS·CHEA 로고는 프로젝트에 제공된 적이 없다.** 인터넷에서 내려받지 않는다.
 * (13단계 지시 19·23항) 관리자가 CMS 에서 Media 를 연결하면 바로 나타난다.
 */
export default async function DesignBDegreePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const pages = getPageContent(locale, numbers);
  const content = pages.degree;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  const degrees = sections.degrees;
  const foreign = sections["foreign-doctorate"];
  const accreditation = sections.accreditation;
  const university = sections.university;
  const faqLink = sections["faq-link"];

  return (
    <>
      <PageHeroB intro={toPageIntro(sections.intro, content.intro)} />

      {degrees && (
        <SectionB>
          <SectionHeadB
            index={1}
            title={degrees.title ?? ""}
            description={degrees.subtitle ?? undefined}
          />

          <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-2">
            {content.degrees.items.map((degree) => (
              <li key={degree.code} className="bg-paper px-8 py-12 lg:px-10">
                <p className="font-serif text-4xl font-bold tracking-[0.06em] text-ink">
                  {degree.code}
                </p>
                <h3 className="mt-5 font-serif text-xl font-bold text-ink/85">
                  {degree.name}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.9] text-quiet">
                  {degree.summary}
                </p>
              </li>
            ))}
          </ul>
        </SectionB>
      )}

      {foreign && (
        <SectionB tone="ink">
          <SectionHeadB index={2} title={foreign.title ?? ""} tone="dark" />

          <div className="mt-12">
            <ProseB paragraphs={foreign.paragraphs} tone="dark" />
          </div>

          {foreign.highlight && (
            <div className="mt-10">
              <PullQuoteB tone="dark">{foreign.highlight}</PullQuoteB>
            </div>
          )}

          {foreign.note && (
            <p className="mt-8 max-w-3xl text-[1.0625rem] leading-[1.95] text-white/70">
              {foreign.note}
            </p>
          )}
        </SectionB>
      )}

      {accreditation && accreditation.items.length > 0 && (
        <SectionB tone="paper-2">
          <SectionHeadB
            index={3}
            title={accreditation.title ?? ""}
            description={accreditation.subtitle ?? undefined}
          />

          <ul className="mt-14 grid gap-px bg-rule lg:grid-cols-2">
            {toPairs(accreditation.items).map((item) => (
              <li key={item.id} className="bg-paper px-8 py-10">
                <h3 className="flex items-center gap-4 font-serif text-xl font-bold text-ink">
                  {/* 로고가 있으면 선 대신 로고를 쓴다. 둘 다 보이면 산만하다. */}
                  {item.media ? (
                    <ItemImageB media={item.media} size={40} />
                  ) : (
                    <span aria-hidden="true" className="h-px w-6 bg-bronze" />
                  )}
                  {item.label}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-[1.9] text-ink/75">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>

          {accreditation.note && (
            <p className="mt-8 text-xs text-quiet">{accreditation.note}</p>
          )}
        </SectionB>
      )}

      {university && university.paragraphs.length > 0 && (
        <SectionB>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeadB index={4} title={university.title ?? ""} />
            </div>
            <div className="lg:col-span-7">
              <ProseB paragraphs={university.paragraphs} />

              {oikosLink?.href && (
                <a
                  href={oikosLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex items-center border border-ink/30 px-7 py-4 text-xs font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
                >
                  {content.university.officialSiteLabel} ↗
                </a>
              )}
            </div>
          </div>
        </SectionB>
      )}

      {faqLink && (
        <SectionB tone="paper-2" size="compact">
          <div className="flex flex-col gap-8 border border-rule bg-paper px-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div>
              {faqLink.title && (
                <h2 className="font-serif text-2xl font-bold text-ink">
                  {faqLink.title}
                </h2>
              )}
              {faqLink.subtitle && (
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-quiet">
                  {faqLink.subtitle}
                </p>
              )}
            </div>

            <ButtonB href={bPath(locale, "/faq")} variant="solid">
              {faqLink.note ?? content.faqLink.cta}
            </ButtonB>
          </div>
        </SectionB>
      )}

      <RelatedLinksB
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/faq", label: pages.related.faq },
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
