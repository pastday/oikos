import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { getPageSections, getProgramNumbers } from "@/lib/cms/queries";
import { toPageIntro, toPairs } from "@/lib/cms/page-view";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { externalLinks } from "@/lib/site-links";

const PAGE_PATH = "/degree";
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

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: intro.title,
    description: intro.description,
  });
}

/**
 * 학위 및 인증.
 *
 * 문구는 DB(`PageSection`)가 출처지만, **학위 카드의 학기·학점은 `Program` 에서 읽는다.**
 * 같은 수치를 CMS 문구로 한 번 더 적어 두면 과정 정보를 고쳤을 때 두 값이 갈라진다.
 */
export default async function DegreePage({ params }: PageProps) {
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
      <PageHero intro={toPageIntro(sections.intro, content.intro)} />

      {degrees && (
        <Section
          title={degrees.title ?? undefined}
          description={degrees.subtitle ?? undefined}
        >
          <ul className="grid gap-5 sm:grid-cols-2">
            {content.degrees.items.map((degree) => (
              <li
                key={degree.code}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <p className="font-serif text-2xl font-bold tracking-wide text-navy">
                  {degree.code}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground/85">
                  {degree.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{degree.summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {foreign && (
        <Section title={foreign.title ?? undefined} tone="surface">
          <Prose paragraphs={foreign.paragraphs} />

          {foreign.highlight && (
            <p className="mt-6 max-w-3xl rounded-md border-l-2 border-gold bg-beige px-5 py-4 text-sm leading-relaxed font-medium text-navy">
              {foreign.highlight}
            </p>
          )}

          {foreign.note && (
            <p className="mt-5 max-w-3xl text-[0.9375rem] leading-[1.85] text-foreground/80">
              {foreign.note}
            </p>
          )}
        </Section>
      )}

      {accreditation && accreditation.items.length > 0 && (
        <Section
          title={accreditation.title ?? undefined}
          description={accreditation.subtitle ?? undefined}
        >
          <ul className="grid gap-4 lg:grid-cols-2">
            {toPairs(accreditation.items).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <h3 className="flex items-center gap-2.5 text-base font-semibold text-navy">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-gold"
                  />
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>

          {accreditation.note && (
            <p className="mt-6 text-xs text-muted">{accreditation.note}</p>
          )}
        </Section>
      )}

      {university && university.paragraphs.length > 0 && (
        <Section title={university.title ?? undefined} tone="surface">
          <Prose paragraphs={university.paragraphs} />

          {oikosLink?.href && (
            <a
              href={oikosLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {content.university.officialSiteLabel} ↗
            </a>
          )}
        </Section>
      )}

      {faqLink && (
        <Section>
          <div className="flex flex-col gap-5 rounded-xl border border-line bg-beige px-7 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {faqLink.title && (
                <h2 className="font-serif text-xl font-bold text-navy">
                  {faqLink.title}
                </h2>
              )}
              {faqLink.subtitle && (
                <p className="mt-2 text-sm text-foreground/70">
                  {faqLink.subtitle}
                </p>
              )}
            </div>

            <Link
              href={localePath(locale, "/faq")}
              className="inline-flex w-fit shrink-0 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
            >
              {faqLink.note ?? content.faqLink.cta}
            </Link>
          </div>
        </Section>
      )}

      <RelatedLinks
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
