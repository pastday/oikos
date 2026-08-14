import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { FactGrid, Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { externalLinks } from "@/lib/site-links";

const PAGE_PATH = "/about";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale).about;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale);
  const content = pages.about;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  return (
    <>
      <PageHero intro={content.intro} />

      {/* 총장 인사말: 원본 자료에 본문이 없어 안내만 둔다. 임의로 작성하지 않는다. */}
      <Section>
        <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-7">
          <h2 className="text-base font-semibold text-navy">
            {content.presidentNotice.title}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {content.presidentNotice.body}
          </p>
        </div>
      </Section>

      <Section title={content.school.title} tone="surface">
        <Prose paragraphs={content.school.paragraphs} />
      </Section>

      <Section title={content.philosophy.title}>
        <Prose paragraphs={content.philosophy.paragraphs} />
      </Section>

      <Section title={content.goals.title} tone="surface">
        <ul className="grid gap-5 sm:grid-cols-2">
          {content.goals.items.map((goal) => (
            <li
              key={goal.title}
              className="rounded-lg border border-line bg-background p-6"
            >
              <h3 className="text-base font-semibold text-navy">
                {goal.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {goal.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={content.university.title}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Prose paragraphs={content.university.paragraphs} />

          <div>
            <FactGrid items={content.university.facts} columns={2} />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={localePath(locale, "/degree")}
                className="inline-flex rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                {content.university.degreeLinkLabel}
              </Link>

              {oikosLink?.href && (
                <a
                  href={oikosLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-foreground/75 transition-colors hover:border-navy hover:text-navy"
                >
                  {content.university.officialSiteLabel} ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/programs", label: pages.related.programs },
          { path: "/faculty", label: pages.related.faculty },
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
