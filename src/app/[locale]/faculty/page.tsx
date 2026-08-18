import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent, type FacultyContent } from "@/content/pages";
import { getProgramNumbers, getPublishedFacultyGroups } from "@/lib/cms/queries";
import type { FacultyView } from "@/lib/cms/types";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";

const PAGE_PATH = "/faculty";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).faculty;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * 교수진 페이지.
 *
 * 교수 정보는 DB(`Faculty`)에서 읽는다. 관리자가 CMS 에서 추가·수정하면 이 화면에 반영된다.
 * **공개된 교수가 없는 구분은 섹션 자체를 그리지 않는다.** 빈 카드를 늘어놓지 않기 위함이다.
 * 개인 연락처(이메일·전화)는 대표 연락처로 확정되지 않아 화면에 노출하지 않는다.
 */
export default async function FacultyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.faculty;
  const groups = await getPublishedFacultyGroups(locale);

  return (
    <>
      <PageHero intro={content.intro} />

      {groups.length === 0 ? (
        <Section>
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
            <h2 className="text-base font-semibold text-navy">
              {content.emptyNotice.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{content.emptyNotice.body}</p>
          </div>
        </Section>
      ) : (
        groups.map((group, index) => (
          <Section
            key={group.type}
            title={content.groupTitles[group.type]}
            tone={index % 2 === 1 ? "surface" : "light"}
          >
            <ul className="grid gap-6">
              {group.members.map((member) => (
                <li key={member.id}>
                  <FacultyCard member={member} labels={content.labels} />
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}

      <Section tone={groups.length % 2 === 1 ? "surface" : "light"}>
        <div className="rounded-lg border border-dashed border-line bg-background px-6 py-7">
          <h2 className="text-base font-semibold text-navy">
            {content.pendingNotice.title}
          </h2>
          <p className="mt-2 text-sm text-muted">{content.pendingNotice.body}</p>
        </div>
        <p className="mt-5 text-xs text-muted">{content.contactNotice}</p>
      </Section>

      <RelatedLinks
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

/** 교수 한 명. 사진이 없으면 이니셜 아바타를 쓴다. */
function FacultyCard({
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
    <article className="grid gap-8 rounded-xl border border-line bg-surface p-7 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10 sm:p-9">
      {member.photo ? (
        // 크기가 고정된 원형 아바타라 next/image 로 그린다.
        // alt 는 Media 에 입력된 값을 쓴다. 비어 있으면 장식용으로 취급되어
        // 화면 읽기 프로그램이 건너뛴다. 바로 옆에 이름이 글자로 있어 그 편이 정확하다.
        <Image
          src={member.photo.url}
          alt={member.photo.alt}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-navy font-serif text-2xl font-bold tracking-wide text-gold-soft"
        >
          {member.initials}
        </span>
      )}

      <div className="min-w-0">
        <h3 className="text-2xl font-bold text-navy">{member.name}</h3>
        {member.nameAlt && (
          <p className="mt-1 text-sm text-muted">{member.nameAlt}</p>
        )}

        {member.title && (
          <p className="mt-4 inline-block rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold text-navy">
            {member.title}
          </p>
        )}

        {details.length > 0 && (
          <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-line pt-6">
            {details.map((detail) => (
              <div key={detail.label} className="flex gap-3 text-sm">
                <dt className="w-20 shrink-0 text-muted">{detail.label}</dt>
                {/* 관리자가 입력한 글이다. HTML 로 렌더링하지 않고 줄바꿈만 살린다. */}
                <dd className="font-medium whitespace-pre-line text-foreground/85">
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
