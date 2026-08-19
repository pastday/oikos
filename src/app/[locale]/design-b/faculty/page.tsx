import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BFacultyFeature } from "@/components/site-b/BFacultyFeature";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import { BHeadline, BNotice, BRule } from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getProgramNumbers, getPublishedFacultyGroups } from "@/lib/cms/queries";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).faculty;

  return buildDesignBMetadata({
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * B안 교수진.
 *
 * 교수 정보는 DB(`Faculty`), 사진은 `Media` 관계에서 온다. A안과 같은 조회다.
 * 공개된 교수가 없는 구분은 섹션 자체를 그리지 않는 것도 같다.
 *
 * 한 명씩 **지면 전체 폭을 쓰는 판**으로 세운다. A안처럼 카드에 담아 늘어놓지 않는다.
 * 자료가 한 명뿐인 지금도 페이지가 비어 보이지 않아야 하기 때문이다.
 * 사진이 없으면 세로 인물 자리를 디자인된 면으로 채운다.
 * 실존하지 않는 인물 사진을 만들거나 인터넷 사진을 가져오지 않는다.
 */
export default async function DesignBFacultyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.faculty;
  const groups = await getPublishedFacultyGroups(locale);
  const watermark = dict.site.wordmark;

  return (
    <>
      <BPageHero intro={content.intro} index={2} watermark={watermark} />

      {groups.length === 0 ? (
        <BSection tone="paper">
          <BNotice title={content.emptyNotice.title}>
            {content.emptyNotice.body}
          </BNotice>
        </BSection>
      ) : (
        groups.map((group, groupIndex) => (
          <BSection
            key={group.type}
            index={groupIndex + 1}
            label={content.groupTitles[group.type]}
            tone={groupIndex % 2 === 1 ? "stone" : "paper"}
          >
            <BHeadline>{content.groupTitles[group.type]}</BHeadline>

            <ul className="mt-14 space-y-16 lg:space-y-24">
              {group.members.map((member) => (
                <li key={member.id}>
                  <BFacultyFeature
                    member={member}
                    labels={content.labels}
                    watermark={watermark}
                  />
                </li>
              ))}
            </ul>
          </BSection>
        ))
      )}

      <section className="bg-paper py-14 lg:py-16">
        <div className="mx-auto w-full max-w-site-b px-6 sm:px-10 lg:px-14">
          <BRule className="mb-12" />
          <BNotice title={content.pendingNotice.title}>
            {content.pendingNotice.body}
          </BNotice>
          <p className="mt-8 text-xs text-quiet">{content.contactNotice}</p>
        </div>
      </section>

      <BRelated
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/programs", label: pages.related.programs },
          { path: "/about", label: pages.related.about },
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
