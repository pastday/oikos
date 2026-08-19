import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BButton, BTextLink } from "@/components/site-b/BBlocks";
import { BFrame } from "@/components/site-b/BFrame";
import { BContainer, BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import {
  BBody,
  BEyebrow,
  BHeadline,
  BPullQuote,
} from "@/components/site-b/BType";
import { designBImages } from "@/components/site-b/images";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { bPath } from "@/components/site-b/paths";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { toPageIntro, toPairs } from "@/lib/cms/page-view";
import { getPageSections, getProgramNumbers } from "@/lib/cms/queries";
import { externalLinks } from "@/lib/site-links";
import Image from "next/image";

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
 * ## A안과 무엇이 다른가
 *
 * A안은 학위 2개와 인증 기관들을 모두 같은 회색 카드에 담아 격자로 늘어놓는다.
 * B안은 **학위는 큰 글자 두 줄**로, **인증은 가로로 이어지는 띠**로 둔다.
 * 인증 기관 이름 자체가 이 페이지에서 가장 신뢰를 주는 정보이므로 크게 세운다.
 *
 * 로고가 CMS 에 연결되어 있으면 이름 옆에 나온다. 없으면 이름만으로 완성된다.
 * **BPPE·TRACS·CHEA 로고는 프로젝트에 제공된 적이 없다.** 인터넷에서 내려받지 않는다.
 */
export default async function DesignBDegreePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, numbers);
  const content = pages.degree;
  const watermark = dict.site.wordmark;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  const degrees = sections.degrees;
  const foreign = sections["foreign-doctorate"];
  const accreditation = sections.accreditation;
  const university = sections.university;
  const faqLink = sections["faq-link"];

  const accreditationItems = accreditation ? toPairs(accreditation.items) : [];
  const [foreignLead, ...foreignRest] = foreign?.paragraphs ?? [];

  return (
    <>
      <BPageHero
        intro={toPageIntro(sections.intro, content.intro)}
        index={6}
        media={accreditation?.media ?? null}
        staticSrc={designBImages.architecture}
        watermark={watermark}
      />

      {degrees && (
        <BSection index={1} label={degrees.title ?? undefined} tone="paper">
          <BHeadline>{degrees.title ?? ""}</BHeadline>
          {degrees.subtitle && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-quiet">
              {degrees.subtitle}
            </p>
          )}

          {/* 학위 코드를 큰 글자로 세운다. 카드에 담지 않는다. */}
          <ul className="mt-14 border-t border-rule">
            {content.degrees.items.map((degree) => (
              <li key={degree.code} className="border-b border-rule">
                <div className="grid gap-4 py-10 lg:grid-cols-12 lg:items-baseline lg:gap-10">
                  <p className="font-serif text-5xl font-bold tracking-[0.04em] text-ink lg:col-span-3 lg:text-6xl">
                    {degree.code}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-ink lg:col-span-4">
                    {degree.name}
                  </h3>
                  <p className="max-w-[52ch] text-[0.9375rem] leading-[1.85] text-quiet lg:col-span-5">
                    {degree.summary}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </BSection>
      )}

      {foreign && (
        <BSection index={2} label={foreign.title ?? undefined} tone="ink">
          <BHeadline tone="dark" size="small">
            {foreign.title ?? ""}
          </BHeadline>

          {foreignLead && (
            <BPullQuote tone="dark" className="mt-8">
              {foreignLead}
            </BPullQuote>
          )}

          <div className="mt-12">
            <BBody paragraphs={foreignRest} tone="dark" columns={2} />
          </div>

          {foreign.highlight && (
            <p className="mt-12 max-w-3xl border-l-2 border-bronze-2 py-2 pl-6 font-serif text-xl leading-[1.6] text-white sm:text-2xl">
              {foreign.highlight}
            </p>
          )}

          {foreign.note && (
            <p className="mt-8 max-w-[62ch] text-[0.9375rem] leading-[1.85] text-white/65">
              {foreign.note}
            </p>
          )}
        </BSection>
      )}

      {accreditationItems.length > 0 && (
        <BSection
          index={3}
          label={accreditation?.title ?? undefined}
          tone="stone"
        >
          <BHeadline>{accreditation?.title ?? ""}</BHeadline>
          {accreditation?.subtitle && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-quiet">
              {accreditation.subtitle}
            </p>
          )}

          {/* 기관 이름을 크게. 로고가 연결돼 있으면 이름 옆에 붙는다. */}
          <ul className="mt-14 border-t border-rule-2/60">
            {accreditationItems.map((item) => (
              <li key={item.id} className="border-b border-rule-2/60">
                <div className="grid gap-5 py-9 lg:grid-cols-12 lg:items-start lg:gap-10">
                  <h3 className="flex items-center gap-4 font-serif text-2xl font-bold text-ink lg:col-span-5 lg:text-3xl">
                    {item.media && (
                      <span className="relative inline-block h-11 w-11 shrink-0">
                        <Image
                          src={item.media.url}
                          alt={item.media.alt}
                          fill
                          sizes="44px"
                          className="object-contain"
                        />
                      </span>
                    )}
                    {item.label}
                  </h3>
                  <p className="max-w-[62ch] text-[0.9375rem] leading-[1.9] text-ink/75 lg:col-span-7">
                    {item.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {accreditation?.note && (
            <p className="mt-8 text-xs text-quiet">{accreditation.note}</p>
          )}
        </BSection>
      )}

      {university && university.paragraphs.length > 0 && (
        <BSection index={4} label={university.title ?? undefined} tone="paper">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <BHeadline>{university.title ?? ""}</BHeadline>
                <BFrame
                  media={university.media}
                  watermark={watermark}
                  ratio="4/5"
                  className="mt-10"
                  sizes="(min-width: 1024px) 22rem, 100vw"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <BBody paragraphs={university.paragraphs} />

              {oikosLink?.href && (
                <div className="mt-10">
                  <BButton href={oikosLink.href} tone="outline" external>
                    {content.university.officialSiteLabel} ↗
                  </BButton>
                </div>
              )}
            </div>
          </div>
        </BSection>
      )}

      {faqLink && (
        <section className="border-t border-rule bg-paper py-14 lg:py-16">
          <BContainer>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                {faqLink.title && <BEyebrow>{faqLink.title}</BEyebrow>}
                {faqLink.subtitle && (
                  <p className="mt-4 max-w-2xl font-serif text-xl leading-snug font-bold text-ink sm:text-2xl">
                    {faqLink.subtitle}
                  </p>
                )}
              </div>

              <BTextLink href={bPath(locale, "/faq")}>
                {faqLink.note ?? content.faqLink.cta}
              </BTextLink>
            </div>
          </BContainer>
        </section>
      )}

      <BRelated
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
