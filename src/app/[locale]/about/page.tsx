import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { FactGrid, Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { getPageSections, getProgramNumbers } from "@/lib/cms/queries";
import { toPageIntro, toPairs } from "@/lib/cms/page-view";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { externalLinks } from "@/lib/site-links";

const PAGE_PATH = "/about";
const PAGE_KEY = "about";

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
    getPageContent(locale, numbers).about.intro,
  );

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: intro.title,
    description: intro.description,
  });
}

/**
 * 대학원 소개.
 *
 * 10단계부터 **본문은 DB(`PageSection`)가 출처**다.
 * 정적 콘텐츠 파일은 이관 원본이자 관련 링크·버튼 문구 같은 UI 문구용으로만 남는다.
 * 섹션이 없거나 비어 있으면 그 부분을 그리지 않는다. 페이지는 깨지지 않는다.
 */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const pages = getPageContent(locale, numbers);
  const content = pages.about;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  const president = sections.president;
  const school = sections.school;
  const philosophy = sections.philosophy;
  const goals = sections.goals;
  const university = sections.university;
  const facts = university ? toPairs(university.items) : [];

  return (
    <>
      <PageHero intro={toPageIntro(sections.intro, content.intro)} />

      {/* 총장 인사말: 원본 자료에 본문이 없어 안내만 둔다. 임의로 작성하지 않는다. */}
      {president && (president.title || president.paragraphs.length > 0) && (
        <Section>
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-7">
            {president.title && (
              <h2 className="text-base font-semibold text-navy">
                {president.title}
              </h2>
            )}
            {president.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-2 text-sm text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </Section>
      )}

      {school && school.paragraphs.length > 0 && (
        <Section title={school.title ?? undefined} tone="surface">
          <Prose paragraphs={school.paragraphs} />
        </Section>
      )}

      {philosophy && philosophy.paragraphs.length > 0 && (
        <Section title={philosophy.title ?? undefined}>
          <Prose paragraphs={philosophy.paragraphs} />
        </Section>
      )}

      {goals && goals.items.length > 0 && (
        <Section title={goals.title ?? undefined} tone="surface">
          <ul className="grid gap-5 sm:grid-cols-2">
            {toPairs(goals.items).map((goal) => (
              <li
                key={goal.id}
                className="rounded-lg border border-line bg-background p-6"
              >
                <h3 className="text-base font-semibold text-navy">
                  {goal.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {goal.value}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {university && (
        <Section title={university.title ?? undefined}>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Prose paragraphs={university.paragraphs} />

            <div>
              {facts.length > 0 && <FactGrid items={facts} columns={2} />}

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
      )}

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
