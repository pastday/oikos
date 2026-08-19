import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { SectionImageB } from "@/components/site-b/MediaBlocksB";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { bPath } from "@/components/site-b/paths";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import {
  ButtonB,
  FactGridB,
  NoticeB,
  ProseB,
  SectionB,
  SectionHeadB,
} from "@/components/site-b/SectionB";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { toPageIntro, toPairs } from "@/lib/cms/page-view";
import { getPageSections, getProgramNumbers } from "@/lib/cms/queries";
import { externalLinks } from "@/lib/site-links";

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

  return buildDesignBMetadata({
    title: intro.title,
    description: intro.description,
  });
}

/**
 * B안 대학원 소개.
 *
 * **A안과 같은 `PageSection` 행을 같은 규칙으로 읽는다.** 섹션이 없거나 비어 있으면
 * 그 부분을 그리지 않는 것도 같다. 관리자가 CMS 에서 고치면 두 안에 함께 반영된다.
 * 달라지는 것은 조판뿐이다.
 */
export default async function DesignBAboutPage({ params }: PageProps) {
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
      <PageHeroB intro={toPageIntro(sections.intro, content.intro)} />

      {/* 총장 인사말: 원본 자료에 본문이 없어 안내만 둔다. 임의로 작성하지 않는다. */}
      {president && (president.title || president.paragraphs.length > 0) && (
        <SectionB size="compact">
          <NoticeB title={president.title ?? ""}>
            {president.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </NoticeB>
        </SectionB>
      )}

      {school && school.paragraphs.length > 0 && (
        <SectionB tone="paper-2">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <SectionHeadB index={1} title={school.title ?? ""} />
              </div>
            </div>
            <div className="lg:col-span-7">
              <ProseB paragraphs={school.paragraphs} />
              {/* 이미지가 지정되지 않았으면 빈 칸을 남기지 않는다. */}
              {school.media && (
                <SectionImageB media={school.media} className="mt-12" />
              )}
            </div>
          </div>
        </SectionB>
      )}

      {philosophy && philosophy.paragraphs.length > 0 && (
        <SectionB>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeadB index={2} title={philosophy.title ?? ""} />
            </div>
            <div className="lg:col-span-7">
              <ProseB paragraphs={philosophy.paragraphs} />
            </div>
          </div>
        </SectionB>
      )}

      {goals && goals.items.length > 0 && (
        <SectionB tone="ink">
          <SectionHeadB index={3} title={goals.title ?? ""} tone="dark" />

          <ol className="mt-14 grid gap-px bg-white/15 sm:grid-cols-2">
            {toPairs(goals.items).map((goal, index) => (
              <li key={goal.id} className="bg-ink px-8 py-11 lg:px-10">
                <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze-2">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {goal.media && (
                  <SectionImageB media={goal.media} className="mt-5" />
                )}
                <h3 className="mt-5 font-serif text-2xl font-bold text-white">
                  {goal.label}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-[1.9] text-white/65">
                  {goal.value}
                </p>
              </li>
            ))}
          </ol>
        </SectionB>
      )}

      {university && (
        <SectionB>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeadB index={4} title={university.title ?? ""} />
            </div>

            <div className="lg:col-span-7">
              <ProseB paragraphs={university.paragraphs} />

              {facts.length > 0 && (
                <div className="mt-12">
                  <FactGridB items={facts} columns={2} />
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonB href={bPath(locale, "/degree")} variant="outline">
                  {content.university.degreeLinkLabel}
                </ButtonB>

                {oikosLink?.href && (
                  <a
                    href={oikosLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-7 py-4 text-xs font-semibold tracking-[0.14em] text-quiet uppercase transition-colors hover:text-ink"
                  >
                    {content.university.officialSiteLabel} ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </SectionB>
      )}

      <RelatedLinksB
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
