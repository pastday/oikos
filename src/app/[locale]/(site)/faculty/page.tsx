import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent, type FacultyContent } from "@/content/pages";
import { getProgramNumbers, getPublishedFacultyGroups } from "@/lib/cms/queries";
import {
  hasFacultyProfile,
  type FacultyArticleView,
  type FacultyBookView,
  type FacultyView,
} from "@/lib/cms/types";
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
                  <FacultyCard
                    member={member}
                    labels={content.labels}
                    links={content.externalLinks}
                  />
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
  links,
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
  links: FacultyContent["externalLinks"];
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

          {/* 저서 · 언론보도는 항목마다 줄이 여러 개라 늘 지면 전체 폭을 쓴다. (15단계) */}
          {member.books.length > 0 && (
            <ProfileBlock label={labels.books} className="lg:col-span-2">
              <ul className="grid gap-4 sm:grid-cols-2">
                {member.books.map((book) => (
                  <li key={book.id}>
                    <BookCard book={book} links={links} />
                  </li>
                ))}
              </ul>
            </ProfileBlock>
          )}

          {member.articles.length > 0 && (
            <ProfileBlock label={labels.articles} className="lg:col-span-2">
              <ul className="grid gap-3">
                {member.articles.map((article) => (
                  <li key={article.id}>
                    <ArticleCard article={article} links={links} />
                  </li>
                ))}
              </ul>
            </ProfileBlock>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * 저서 한 권. (15단계)
 *
 * 표지 자리를 **먼저 잡아 두고** 사진이 없으면 제목을 글자로 앉힌 면으로 채운다.
 * 회색 빈 사각형은 그리지 않는다. 그 글자는 바로 옆 제목과 같은 내용이라
 * `aria-hidden` 으로 숨긴다. 화면 읽기 프로그램이 제목을 두 번 읽지 않게 한다.
 *
 * 표지가 없는 것이 기본 상태다. 서점 이미지를 내려받거나 걸어 두지 않는다. (CLAUDE.md 22항)
 */
function BookCard({
  book,
  links,
}: {
  book: FacultyBookView;
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex h-full min-w-0 gap-4 rounded-lg border border-line bg-background p-4">
      <div className="w-16 shrink-0 sm:w-20">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-line bg-navy">
          {book.cover ? (
            <Image
              src={book.cover.url}
              alt={book.cover.alt}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            // `line-clamp` 은 `display: -webkit-box` 를 건다. 같은 요소에 `flex` 를
            // 함께 주면 두 display 가 부딪혀 어느 쪽이 이길지 CSS 순서에 맡겨진다.
            // 가운데 정렬은 바깥에서, 줄 수 제한은 안쪽에서 따로 건다.
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center px-1.5"
            >
              <span className="line-clamp-5 text-center font-serif text-[0.625rem] leading-snug font-bold break-words text-gold-soft">
                {book.title}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h5 className="text-sm leading-snug font-bold break-words text-navy">
          {book.title}
        </h5>

        {book.subtitle && (
          <p className="text-xs leading-snug break-words text-foreground/70">
            {book.subtitle}
          </p>
        )}

        {book.meta && (
          <p className="text-xs break-words text-muted">{book.meta}</p>
        )}

        {book.description && (
          <p className="text-xs leading-relaxed break-words text-foreground/80">
            {book.description}
          </p>
        )}

        {book.url && (
          <ExternalLink href={book.url} label={links.book} context={book.title} newTab={links.newTab} />
        )}
      </div>
    </article>
  );
}

/**
 * 기사 한 건. (15단계)
 *
 * **기사 본문을 옮겨 담지 않는다.** 제목 · 게시처 · 게시일 · 우리가 쓴 짧은 소개 ·
 * 원문 링크까지만이다. 기사에 실린 사진도 쓰지 않는 것이 기본이다. (CLAUDE.md 22항)
 * 사용권이 확인된 이미지가 등록되면 그때만 왼쪽에 나온다.
 */
function ArticleCard({
  article,
  links,
}: {
  article: FacultyArticleView;
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex min-w-0 gap-4 rounded-lg border border-line bg-background p-4">
      {article.image && (
        <div className="w-20 shrink-0 sm:w-28">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line bg-surface">
            <Image
              src={article.image.url}
              alt={article.image.alt}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <h5 className="text-sm leading-snug font-bold break-words text-navy">
          {article.title}
        </h5>

        {article.meta && (
          <p className="text-xs break-words text-muted">{article.meta}</p>
        )}

        {article.summary && (
          <p className="text-xs leading-relaxed break-words text-foreground/80">
            {article.summary}
          </p>
        )}

        {article.url && (
          <ExternalLink
            href={article.url}
            label={links.article}
            context={article.title}
            newTab={links.newTab}
          />
        )}
      </div>
    </article>
  );
}

/**
 * 원문으로 나가는 링크.
 *
 * `href` 는 조회 단계에서 `toSafeUrl()` 을 통과한 http(s) 주소만 들어온다.
 * 새 탭으로 여는 링크에는 `rel="noopener noreferrer"` 를 반드시 함께 둔다.
 * 링크 문구가 "도서 보기" 처럼 짧아 목록에서 여러 개가 같은 말이 되므로,
 * 무엇의 링크인지와 새 창으로 열린다는 사실을 숨긴 글자로 덧붙인다.
 */
function ExternalLink({
  href,
  label,
  context,
  newTab,
}: {
  href: string;
  label: string;
  context: string;
  newTab: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-navy underline-offset-4 hover:underline"
    >
      {label}
      <span aria-hidden="true">→</span>
      <span className="sr-only">
        {" "}
        — {context} ({newTab})
      </span>
    </a>
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
