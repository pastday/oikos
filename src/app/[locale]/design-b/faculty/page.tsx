import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import { NoticeB, SectionB, SectionHeadB } from "@/components/site-b/SectionB";
import { getPageContent, type FacultyContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { getProgramNumbers, getPublishedFacultyGroups } from "@/lib/cms/queries";
import type { FacultyView } from "@/lib/cms/types";

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
 * **사진이 없으면 이니셜 판을 쓴다.** 인터넷 인물 사진을 가져오거나 만들어 내지 않는다.
 * (13단계 지시 16항) 개인 연락처는 대표 연락처가 확정되지 않아 노출하지 않는다.
 */
export default async function DesignBFacultyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.faculty;
  const groups = await getPublishedFacultyGroups(locale);

  return (
    <>
      <PageHeroB intro={content.intro} />

      {groups.length === 0 ? (
        <SectionB>
          <NoticeB title={content.emptyNotice.title}>
            {content.emptyNotice.body}
          </NoticeB>
        </SectionB>
      ) : (
        groups.map((group, index) => (
          <SectionB
            key={group.type}
            tone={index % 2 === 1 ? "paper-2" : "paper"}
          >
            <SectionHeadB
              index={index + 1}
              title={content.groupTitles[group.type]}
            />

            <ul className="mt-14 space-y-px">
              {group.members.map((member) => (
                <li key={member.id}>
                  <FacultyCardB member={member} labels={content.labels} />
                </li>
              ))}
            </ul>
          </SectionB>
        ))
      )}

      <SectionB
        tone={groups.length % 2 === 1 ? "paper-2" : "paper"}
        size="compact"
      >
        <NoticeB title={content.pendingNotice.title}>
          {content.pendingNotice.body}
        </NoticeB>
        <p className="mt-6 text-xs text-quiet">{content.contactNotice}</p>
      </SectionB>

      <RelatedLinksB
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

/**
 * 교수 한 명.
 *
 * 사진 자리를 세로로 긴 판으로 잡는다. 인물 사진은 보통 세로가 길고,
 * 사진이 없을 때도 이니셜을 크게 두면 지면이 비어 보이지 않는다.
 */
function FacultyCardB({
  member,
  labels,
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
}) {
  const details = [
    { label: labels.major, value: member.major },
    { label: labels.career, value: member.career },
    { label: labels.lectureFields, value: member.lectureFields },
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail.value),
  );

  return (
    <article className="grid gap-px bg-rule lg:grid-cols-12">
      <div className="bg-ink lg:col-span-4">
        {member.photo ? (
          // alt 는 Media 에 입력된 값을 쓴다. 비어 있으면 장식용으로 취급되어
          // 화면 읽기 프로그램이 건너뛴다. 바로 옆에 이름이 글자로 있어 그 편이 정확하다.
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={member.photo.url}
              alt={member.photo.alt}
              fill
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-[4/5] w-full items-center justify-center bg-[radial-gradient(ellipse_70%_70%_at_50%_20%,rgba(168,130,63,0.22),transparent_65%)]"
          >
            <span className="font-serif text-6xl font-bold tracking-[0.1em] text-bronze-2/80">
              {member.initials}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 bg-paper px-8 py-12 lg:col-span-8 lg:px-14 lg:py-16">
        <h3 className="font-serif text-4xl font-bold text-ink lg:text-5xl">
          {member.name}
        </h3>
        {member.nameAlt && (
          <p className="mt-3 text-sm tracking-[0.1em] text-quiet uppercase">
            {member.nameAlt}
          </p>
        )}

        {member.title && (
          <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze uppercase">
            {member.title}
          </p>
        )}

        {details.length > 0 && (
          <dl className="mt-10 border-t border-rule">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <dt className="text-[0.6875rem] font-semibold tracking-[0.16em] text-quiet uppercase">
                  {detail.label}
                </dt>
                {/* 관리자가 입력한 글이다. HTML 로 렌더링하지 않고 줄바꿈만 살린다. */}
                <dd className="text-[0.9375rem] leading-[1.9] whitespace-pre-line text-ink/80">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
