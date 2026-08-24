import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent, type FacultyContent } from "@/content/pages";
import { getProgramNumbers, getPublishedFacultyGroups } from "@/lib/cms/queries";
import { hasFacultyProfile, type FacultyView } from "@/lib/cms/types";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
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

/**
 * 교수 한 명.
 *
 * 위쪽은 **기본정보**(사진·이름·직책·전공), 아래는 **상세 프로필**(소개·학력·경력·전문분야)이다.
 * 두 덩어리를 선으로 나눠 두면 경력이 20줄이 넘어가도 이름과 직책을 찾기 쉽다.
 * 상세가 하나도 없는 교수는 아래 영역을 통째로 그리지 않아 카드가 짧게 끝난다.
 *
 * 사진이 없으면 이니셜 아바타를 쓴다.
 */
function FacultyCard({
  member,
  labels,
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-7 sm:p-9">
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10">
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
          <h3 className="text-2xl font-bold break-words text-navy">{member.name}</h3>
          {member.nameAlt && (
            <p className="mt-1 text-sm break-words text-muted">{member.nameAlt}</p>
          )}

          {member.title && (
            <p className="mt-4 inline-block rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold text-navy">
              {member.title}
            </p>
          )}

          {member.major && (
            <p className="mt-3 text-sm break-words text-foreground/70">
              {member.major}
            </p>
          )}
        </div>
      </div>

      {hasFacultyProfile(member) && (
        <div className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-2 lg:gap-x-12">
          {member.bio.length > 0 && (
            <ProfileBlock label={labels.bio} className="lg:col-span-2">
              <div className="grid gap-3">
                {member.bio.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed break-words text-foreground/85">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ProfileBlock>
          )}

          {member.education.length > 0 && (
            <ProfileBlock label={labels.education}>
              <ProfileList items={member.education} />
            </ProfileBlock>
          )}

          {member.career.length > 0 && (
            <ProfileBlock label={labels.career}>
              <ProfileList items={member.career} />
            </ProfileBlock>
          )}

          {member.lectureFields.length > 0 && (
            <ProfileBlock label={labels.lectureFields} className="lg:col-span-2">
              <ProfileList items={member.lectureFields} />
            </ProfileBlock>
          )}
        </div>
      )}
    </article>
  );
}

/** 상세 프로필 한 항목. 라벨과 내용을 세로로 쌓는다. */
function ProfileBlock({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * 줄 단위로 입력된 값을 목록으로 그린다.
 *
 * 관리자가 입력한 글이므로 **HTML 로 해석하지 않는다.** 글머리표는 화면이 그리고
 * 글자는 그대로 넣는다. 항목이 몇 개든 세로로 이어지므로 길이 제한을 두지 않는다.
 */
function ProfileList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2.5 text-sm leading-relaxed text-foreground/85"
        >
          <span
            aria-hidden="true"
            className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-gold"
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}
