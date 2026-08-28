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
  isYouTubeUrl,
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
            {/*
              교수 사이를 **카드가 아니라 선과 여백으로** 나눈다. (17단계)
              전에는 교수 한 명이 통째로 회색 상자에 들어가 있었는데, 경력이 길어질수록
              그 상자가 화면을 가득 채워 이력서 양식처럼 보였다.
            */}
            <ul className="grid gap-16 lg:gap-20 [&>li+li]:border-t [&>li+li]:border-line [&>li+li]:pt-16 lg:[&>li+li]:pt-20">
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
 * 교수 한 명. (17단계에서 editorial profile 로 다시 짰다)
 *
 * ## 왜 상자를 걷어냈는가
 *
 * 전에는 기본정보부터 언론보도까지 전부 `rounded-xl border bg-surface` 상자 하나에
 * 들어 있었다. 김동준 교수처럼 경력이 15줄이 넘어가면 그 상자가 화면을 가득 채워
 * **대학 교수 소개가 아니라 행정 서식처럼** 보였다.
 *
 * 지금은 상자를 쓰지 않는다. 대신
 *
 *   1. 기본정보와 상세 프로필을 가는 선 하나로 나누고
 *   2. 상세 프로필의 각 절은 **제목 + 짧은 금색 밑줄 + 넉넉한 세로 여백**으로만 나눈다
 *
 * 교수가 여럿일 때는 목록 쪽에서 `li` 사이에 선을 그어 구분한다.
 * 상세가 하나도 없는 교수는 아래 영역을 통째로 그리지 않는다.
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
    <article className="min-w-0">
      <header className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-9">
        {member.photo ? (
          // 크기가 고정된 원형 아바타라 next/image 로 그린다.
          // alt 는 Media 에 입력된 값을 쓴다. 비어 있으면 장식용으로 취급되어
          // 화면 읽기 프로그램이 건너뛴다. 바로 옆에 이름이 글자로 있어 그 편이 정확하다.
          <Image
            src={member.photo.url}
            alt={member.photo.alt}
            width={128}
            height={128}
            className="h-28 w-28 rounded-full object-cover ring-1 ring-navy/10 sm:h-32 sm:w-32"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-28 w-28 items-center justify-center rounded-full bg-navy font-serif text-3xl font-bold tracking-wide text-gold-soft sm:h-32 sm:w-32"
          >
            {member.initials}
          </span>
        )}

        <div className="min-w-0">
          {/*
            이름 크기는 페이지 제목(h1 `text-3xl`/`lg:text-4xl`)보다 한 단계 아래로 둔다.
            같은 크기로 키웠더니 페이지 제목과 교수 이름 중 무엇이 위인지 읽히지 않았다.
            지금 위계는 h1 36 → 이름 28 → 구분 제목 24 → 절 라벨 14 다.
          */}
          <h3 className="font-serif text-[1.75rem] leading-tight font-bold break-words text-navy">
            {member.name}
          </h3>

          {member.nameAlt && (
            <p className="mt-1.5 text-sm tracking-wide break-words text-muted">
              {member.nameAlt}
            </p>
          )}

          {(member.title || member.major) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              {member.title && (
                <span className="inline-block max-w-full rounded-full bg-navy-tint px-4 py-1.5 text-xs font-semibold break-words text-navy">
                  {member.title}
                </span>
              )}
              {member.title && member.major && (
                <span aria-hidden="true" className="h-3.5 w-px bg-line" />
              )}
              {member.major && (
                <span className="text-sm break-words text-foreground/70">
                  {member.major}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {hasFacultyProfile(member) && (
        // 절 사이 여백이 곧 구분선 역할을 한다. 상자를 쓰지 않는 이유다.
        <div className="mt-10 flex flex-col gap-12 border-t border-line pt-10 lg:gap-14">
          {member.bio.length > 0 && (
            <ProfileBlock label={labels.bio}>
              {/* 한 줄이 너무 길면 눈이 다음 줄을 놓친다. 폭을 글자 수로 묶는다. */}
              <div className="grid max-w-[68ch] gap-4">
                {member.bio.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[0.9375rem] leading-[1.85] break-words text-foreground/85"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ProfileBlock>
          )}

          {/*
            학력과 주요 경력은 넓은 화면에서 나란히 둔다.
            `items-start` 라 두 제목의 윗선이 정확히 맞는다. 좁은 화면에서는 한 열이다.
          */}
          {(member.education.length > 0 || member.career.length > 0) && (
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-14">
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
            </div>
          )}

          {member.lectureFields.length > 0 && (
            <ProfileBlock label={labels.lectureFields}>
              <Expertise items={member.lectureFields} />
            </ProfileBlock>
          )}

          {/*
            저서와 언론보도는 **같은 폭으로 묶는다.** 한쪽은 작은 카드, 한쪽은
            화면을 가로지르는 긴 막대가 되면 두 절이 서로 다른 화면처럼 보인다.
          */}
          {member.books.length > 0 && (
            <ProfileBlock label={labels.books}>
              <ul className="grid max-w-work gap-5">
                {member.books.map((book) => (
                  <li key={book.id} className="min-w-0">
                    <BookCard book={book} labels={labels} links={links} />
                  </li>
                ))}
              </ul>
            </ProfileBlock>
          )}

          {member.articles.length > 0 && (
            <ProfileBlock label={labels.articles}>
              <ul className="grid max-w-work gap-4">
                {member.articles.map((article) => (
                  <li key={article.id} className="min-w-0">
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
 * 전문분야. (17단계)
 *
 * 전에는 학력·경력과 같은 글머리표 목록이었다. `호텔` `외식` 처럼 **한 낱말짜리**
 * 항목이 여섯 줄을 차지해 세로 공간만 먹고 정보는 적었다. 지금은 낱말 조각으로 늘어놓는다.
 *
 * **누를 수 있는 것처럼 보이면 안 된다.** 실제로 아무 동작도 하지 않으므로
 * 그림자·hover·손가락 커서를 주지 않고 얇은 테두리와 옅은 바탕만 쓴다.
 *
 * 관리자가 낱말이 아니라 문장을 적어 넣을 수도 있다. **하나라도 길면 목록으로 되돌린다.**
 * 긴 글을 조각 안에 넣으면 여러 줄로 접혀 모양이 무너진다. (B안 `BExpertise` 와 같은 규칙)
 */
const EXPERTISE_CHIP_MAX = 30;

function Expertise({ items }: { items: string[] }) {
  const fitsChips = items.every((item) => item.length <= EXPERTISE_CHIP_MAX);
  if (!fitsChips) return <ProfileList items={items} />;

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="max-w-full rounded-md border border-navy/15 bg-navy-tint/60 px-3.5 py-1.5 text-sm break-words text-navy"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * 저서 한 권. (16단계에서 배치를 다시 잡았다)
 *
 * 15단계에는 저자·출판사·연도가 한 줄이었고 카드가 작아 목록처럼 보였다.
 * 지금은 **표지 자리를 크게 잡고** 오른쪽에 작은 표시 → 제목 → 저자 → 서지 →
 * 소개 → 링크를 세로로 세운다. 자료가 한 권뿐이어도 지면이 비어 보이지 않는다.
 *
 * 표지가 없는 것이 기본 상태다. 서점 이미지를 내려받거나 걸어 두지 않는다.
 * (CLAUDE.md 22항) 그 자리는 `BookCoverPlaceholder` 가 채운다.
 */
function BookCard({
  book,
  labels,
  links,
}: {
  book: FacultyBookView;
  labels: FacultyContent["labels"];
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-5 rounded-lg border border-line bg-background p-5 sm:flex-row sm:gap-7 sm:p-6">
      {/* 표지는 실물 책처럼 보이도록 그림자를 얕게 준다. 좁은 화면에서는 위로 올라간다. */}
      <div className="w-[6.5rem] shrink-0 sm:w-[8.5rem]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-md ring-1 ring-navy/15">
          {book.cover ? (
            <Image
              src={book.cover.url}
              alt={book.cover.alt}
              fill
              sizes="136px"
              className="object-cover"
            />
          ) : (
            <BookCoverPlaceholder book={book} />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-gold uppercase">
          {labels.bookEyebrow}
        </p>

        <h5 className="font-serif text-lg leading-snug font-bold break-words text-navy">
          {book.title}
        </h5>

        {book.subtitle && (
          <p className="text-xs leading-snug break-words text-foreground/70">
            {book.subtitle}
          </p>
        )}

        {book.author && (
          <p className="text-xs font-semibold break-words text-foreground/80">
            {book.author}
          </p>
        )}

        {book.imprint && (
          <p className="text-xs break-words text-muted">{book.imprint}</p>
        )}

        {book.description && (
          <p className="mt-1 text-sm leading-[1.75] break-words text-foreground/80">
            {book.description}
          </p>
        )}

        {book.url && (
          <ExternalLink
            href={book.url}
            label={links.book}
            context={book.title}
            newTab={links.newTab}
            className="mt-auto pt-2"
          />
        )}
      </div>
    </article>
  );
}

/**
 * 표지가 없을 때 그 자리를 채우는 면. (16단계)
 *
 * **회색 빈 사각형을 그리지 않는다.** 그건 "이미지를 못 불러왔다" 처럼 보인다.
 * navy 바탕에 ivory·gold 글자를 얹어 편집 디자인처럼 만든다.
 *
 * 실제 표지처럼 오해되지 않도록 **표지 그림을 흉내내지 않는다.**
 * 가는 금색 선 · 제목 · 발행연도, 이 셋뿐이다.
 *
 * 오른쪽 칸에 이미 `저서` 표시가 붙어 있어 **여기서 그 말을 되풀이하지 않는다.**
 * 손바닥만 한 폭 안에서 같은 낱말이 두 번 보이면 표지가 아니라 라벨처럼 읽힌다.
 *
 * 제목·연도가 옆 칸에 이미 글자로 있으므로 전체를 `aria-hidden` 으로 숨긴다.
 * 화면 읽기 프로그램이 제목을 두 번 읽지 않는다.
 */
function BookCoverPlaceholder({ book }: { book: FacultyBookView }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy px-2 py-3 text-center"
    >
      <span className="h-px w-5 shrink-0 bg-gold" />

      {/* `line-clamp` 은 display 를 -webkit-box 로 바꾼다. 정렬은 바깥에서 건다. */}
      <span className="line-clamp-4 font-serif text-[0.6875rem] leading-tight font-bold break-words text-beige">
        {book.title}
      </span>

      {book.year && (
        <span className="text-[0.5rem] font-semibold tracking-[0.12em] text-white/45">
          {book.year}
        </span>
      )}
    </span>
  );
}

/**
 * 기사 한 건. (16단계에서 배치를 다시 잡았다)
 *
 * **단순 링크 목록처럼 보이지 않게** 게시처와 게시일을 맨 위에 작은 글씨로 세우고
 * 그 아래 제목을 크게 둔다. 신문 기사의 머리 부분과 같은 순서다.
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
    <article className="flex min-w-0 gap-5 rounded-lg border border-line bg-background p-5 sm:p-6">
      {article.image && (
        <div className="w-24 shrink-0 sm:w-28">
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

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {(article.publisher || article.publishedOn) && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-muted">
            {article.publisher && (
              <span className="font-semibold tracking-wide break-words text-navy">
                {article.publisher}
              </span>
            )}
            {article.publisher && article.publishedOn && (
              <span aria-hidden="true" className="h-2.5 w-px bg-line" />
            )}
            {article.publishedOn && <span>{article.publishedOn}</span>}
          </p>
        )}

        <h5 className="font-serif text-lg leading-snug font-bold break-words text-navy">
          {article.title}
        </h5>

        {article.summary && (
          <p className="text-sm leading-[1.75] break-words text-foreground/80">
            {article.summary}
          </p>
        )}

        {article.url && (
          <ExternalLink
            href={article.url}
            label={isYouTubeUrl(article.url) ? links.youtube : links.article}
            context={article.title}
            newTab={links.newTab}
            className="pt-1"
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
  className,
}: {
  href: string;
  label: string;
  context: string;
  newTab: string;
  /** 카드마다 위 여백이 달라 바깥에서 정한다. */
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex w-fit items-center gap-1 text-xs font-semibold text-navy underline-offset-4 hover:underline",
        className,
      )}
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
      {/*
        절 제목. (17단계에서 손봤다)

        전에는 옅은 회색 소문자 한 줄이라 본문에 묻혀 절이 어디서 나뉘는지 보이지 않았다.
        지금은 navy 로 올리고 **짧은 금색 밑줄**을 하나 붙인다.
        굵은 가로선을 화면 폭만큼 긋지 않는다. 그러면 표처럼 보인다.
      */}
      <h4 className="text-sm font-bold tracking-[0.08em] text-navy">{label}</h4>
      <span aria-hidden="true" className="mt-2 block h-0.5 w-7 bg-gold" />
      <div className="mt-5">{children}</div>
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
    <ul className="grid gap-2.5">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-3 text-[0.9375rem] leading-[1.7] text-foreground/85"
        >
          <span
            aria-hidden="true"
            className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-gold"
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}
