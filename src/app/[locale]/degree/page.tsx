import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { externalLinks } from "@/lib/site-links";

const PAGE_PATH = "/degree";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale).degree;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * 학위 및 인증 페이지.
 *
 * 인증·인가 내용은 제공된 원본 자료에 기재된 내용을 그대로 옮긴다.
 * 원본보다 강한 표현(예: 정부가 학위를 인정)을 임의로 추가하지 않는다.
 * 외국 박사학위 신고제도는 원본 설명대로 학위 진위 확인 제도가 아님을 분명히 표시한다.
 */
export default async function DegreePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale);
  const content = pages.degree;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  return (
    <>
      <PageHero intro={content.intro} />

      <Section
        title={content.degrees.title}
        description={content.degrees.description}
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

      <Section title={content.foreignDoctorate.title} tone="surface">
        <Prose paragraphs={content.foreignDoctorate.paragraphs} />

        <p className="mt-6 max-w-3xl rounded-md border-l-2 border-gold bg-beige px-5 py-4 text-sm leading-relaxed font-medium text-navy">
          {content.foreignDoctorate.highlight}
        </p>

        <p className="mt-5 max-w-3xl text-[0.9375rem] leading-[1.85] text-foreground/80">
          {content.foreignDoctorate.registrar}
        </p>
      </Section>

      <Section
        title={content.accreditation.title}
        description={content.accreditation.description}
      >
        <ul className="grid gap-4 lg:grid-cols-2">
          {content.accreditation.items.map((item) => (
            <li
              key={item.name}
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h3 className="flex items-center gap-2.5 text-base font-semibold text-navy">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-gold"
                />
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted">{content.accreditation.note}</p>
      </Section>

      <Section title={content.university.title} tone="surface">
        <Prose paragraphs={content.university.paragraphs} />

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

      <Section>
        <div className="flex flex-col gap-5 rounded-xl border border-line bg-beige px-7 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-navy">
              {content.faqLink.title}
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              {content.faqLink.description}
            </p>
          </div>

          <Link
            href={localePath(locale, "/faq")}
            className="inline-flex w-fit shrink-0 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            {content.faqLink.cta}
          </Link>
        </div>
      </Section>

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
