import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BButton,
  BRowList,
  BStatsBand,
  type BRow,
} from "@/components/site-b/BBlocks";
import { BFrame } from "@/components/site-b/BFrame";
import { BContainer, BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import {
  BBody,
  BHeadline,
  BNotice,
  BPullQuote,
  BRule,
} from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { bPath } from "@/components/site-b/paths";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
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
 *
 * 조판은 A안과 전혀 다르다.
 *  - 상단이 좌우 분할 Hero (비주얼 자리 포함)
 *  - 본문은 선언문 + 2단 흐름
 *  - 비전·목표는 카드 격자가 아니라 번호가 붙은 가로선 목록
 *  - 본교 수치는 상자 없는 통계 띠
 */
export default async function DesignBAboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, numbers);
  const content = pages.about;
  const watermark = dict.site.wordmark;
  const oikosLink = externalLinks.find((link) => link.key === "oikos");

  const president = sections.president;
  const school = sections.school;
  const philosophy = sections.philosophy;
  const goals = sections.goals;
  const university = sections.university;

  const goalRows: BRow[] = goals
    ? toPairs(goals.items).map((goal) => ({
        id: goal.id,
        title: goal.label,
        body: goal.value,
      }))
    : [];

  const facts = university
    ? toPairs(university.items).map((item) => ({
        label: item.label,
        value: item.value,
      }))
    : [];

  const [schoolLead, ...schoolRest] = school?.paragraphs ?? [];

  return (
    <>
      <BPageHero
        intro={toPageIntro(sections.intro, content.intro)}
        index={1}
        media={school?.media ?? null}
        watermark={watermark}
      />

      {/* 총장 인사말: 원본 자료에 본문이 없어 안내만 둔다. 임의로 작성하지 않는다. */}
      {president && (president.title || president.paragraphs.length > 0) && (
        <section className="border-b border-rule bg-paper py-14">
          <BContainer>
            <BNotice title={president.title ?? undefined}>
              {president.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </BNotice>
          </BContainer>
        </section>
      )}

      {school && school.paragraphs.length > 0 && (
        <BSection index={2} label={school.title ?? undefined} tone="paper">
          <BHeadline size="small">{school.title ?? ""}</BHeadline>
          {schoolLead && <BPullQuote className="mt-8">{schoolLead}</BPullQuote>}
          <BRule className="my-12 lg:my-14" />
          <BBody paragraphs={schoolRest} columns={2} />
        </BSection>
      )}

      {philosophy && philosophy.paragraphs.length > 0 && (
        <BSection index={3} label={philosophy.title ?? undefined} tone="stone">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <BHeadline>{philosophy.title ?? ""}</BHeadline>
                <BFrame
                  media={null}
                  watermark={watermark}
                  ratio="3/4"
                  className="mt-10"
                  sizes="(min-width: 1024px) 22rem, 100vw"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <BBody paragraphs={philosophy.paragraphs} />
            </div>
          </div>
        </BSection>
      )}

      {goalRows.length > 0 && (
        <BSection index={4} label={goals?.title ?? undefined} tone="ink">
          <BHeadline tone="dark">{goals?.title ?? ""}</BHeadline>
          <div className="mt-12">
            <BRowList rows={goalRows} tone="dark" size="large" />
          </div>
        </BSection>
      )}

      {university && (
        <BSection index={5} label={university.title ?? undefined} tone="paper">
          <BHeadline>{university.title ?? ""}</BHeadline>

          <div className="mt-10">
            <BBody paragraphs={university.paragraphs} columns={2} />
          </div>

          {facts.length > 0 && (
            <div className="mt-14 border-t border-rule">
              <BStatsBand stats={facts} tone="light" columns={4} />
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <BButton href={bPath(locale, "/degree")} tone="outline">
              {content.university.degreeLinkLabel}
            </BButton>

            {oikosLink?.href && (
              <BButton href={oikosLink.href} tone="outline" external>
                {content.university.officialSiteLabel} ↗
              </BButton>
            )}
          </div>
        </BSection>
      )}

      <BRelated
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
