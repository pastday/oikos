import Image from "next/image";
import type { ReactNode } from "react";
import type { FacultyContent } from "@/content/pages";
import {
  hasFacultyProfile,
  isYouTubeUrl,
  type FacultyArticleView,
  type FacultyBookView,
  type FacultyView,
} from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { BFrame } from "./BFrame";
import { BRule } from "./BType";

/**
 * 교수 한 명을 보여주는 판.
 *
 * 메인의 주임교수 소개와 교수진 페이지가 **같은 것**을 쓴다.
 * 두 화면에서 교수가 다르게 보이지 않게 하려는 것이다.
 *
 * ## 사진이 없을 때
 *
 * A안은 지름 96px 짜리 이니셜 원을 그린다. 자료가 없다는 인상이 그대로 남는다.
 * B안은 **세로로 긴 인물 사진 자리(4:5)를 먼저 만들어 두고** 그 안을
 * `BFrame` 이 만든 면으로 채운 뒤, 이니셜을 큰 글자로 얹는다.
 * 사진이 들어오면 이니셜만 사라지고 배치는 그대로다.
 *
 * 실존하지 않는 인물 사진을 만들거나 인터넷 사진을 가져오지 않는다.
 *
 * ## 상세 프로필 (14단계)
 *
 * 소개·학력·경력·전문분야를 **작은 카드 여럿으로 쪼개지 않는다.** 라벨을 왼쪽에
 * 작은 대문자로 세우고 내용을 오른쪽에 흘린 뒤 얇은 선으로만 나눈다.
 * 경력이 20줄이 넘어가도 세로로 이어질 뿐 배치가 무너지지 않는다.
 *
 * 메인에서는 `detail="brief"` 로 **소개까지만** 보여준다. 메인은 교수진 페이지로
 * 보내는 자리이고, 학력·경력까지 그대로 옮기면 두 화면이 같은 것이 되어
 * "교수진 보기" 링크가 무의미해진다. 데이터는 같고 보여 주는 범위만 다르다.
 */
export function BFacultyFeature({
  member,
  labels,
  links,
  watermark,
  size = "normal",
  detail = "full",
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
  /** 저서·기사 원문으로 나가는 링크 문구. 메인(`brief`)에서는 쓰이지 않는다. */
  links: FacultyContent["externalLinks"];
  watermark: string;
  /** `feature` 는 메인처럼 한 명만 크게 보여줄 때 쓴다. */
  size?: "normal" | "feature";
  /** `brief` 는 소개만 그린다. 메인 Preview 용. */
  detail?: "full" | "brief";
}) {
  const showAll = detail === "full";
  const hasProfile = showAll
    ? hasFacultyProfile(member)
    : member.bio.length > 0;

  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className={size === "feature" ? "lg:col-span-5" : "lg:col-span-4"}>
        <div className="relative">
          <BFrame
            media={member.photo}
            watermark={watermark}
            ratio="4/5"
            sizes="(min-width: 1024px) 26rem, 100vw"
          />

          {/* 사진이 없을 때만 이니셜을 얹는다. 사진이 들어오면 사라진다. */}
          {!member.photo && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-7xl font-bold tracking-[0.08em] text-white/85"
            >
              {member.initials}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "min-w-0",
          size === "feature"
            ? "flex flex-col justify-center lg:col-span-7"
            : "lg:col-span-8",
        )}
      >
        <h3
          className={cn(
            "font-serif font-bold break-words text-ink",
            size === "feature" ? "text-display" : "text-headline",
          )}
        >
          {member.name}
        </h3>

        {member.nameAlt && (
          <p className="mt-4 text-sm tracking-[0.14em] break-words text-quiet uppercase">
            {member.nameAlt}
          </p>
        )}

        {member.title && (
          <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.22em] break-words text-bronze uppercase">
            {member.title}
          </p>
        )}

        {member.major && (
          <p className="mt-3 text-[0.9375rem] break-words text-ink/70">
            {member.major}
          </p>
        )}

        {hasProfile && (
          <dl className="mt-10">
            <BRule />

            {member.bio.length > 0 && (
              <BProfileRow label={labels.bio}>
                <div className="space-y-4">
                  {member.bio.map((paragraph, index) => (
                    <p key={index} className="break-words">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </BProfileRow>
            )}

            {showAll && member.education.length > 0 && (
              <BProfileRow label={labels.education}>
                <BProfileList items={member.education} />
              </BProfileRow>
            )}

            {showAll && member.career.length > 0 && (
              <BProfileRow label={labels.career}>
                <BProfileList items={member.career} />
              </BProfileRow>
            )}

            {showAll && member.lectureFields.length > 0 && (
              <BProfileRow label={labels.lectureFields}>
                <BExpertise items={member.lectureFields} />
              </BProfileRow>
            )}

            {showAll && member.books.length > 0 && (
              <BProfileRow label={labels.books}>
                <ul className="max-w-work space-y-10">
                  {member.books.map((book) => (
                    <li key={book.id} className="min-w-0">
                      <BBook book={book} labels={labels} links={links} />
                    </li>
                  ))}
                </ul>
              </BProfileRow>
            )}

            {showAll && member.articles.length > 0 && (
              <BProfileRow label={labels.articles}>
                {/* 여러 건이 들어오면 얇은 선으로만 나눈다. 상자를 쓰지 않는다. */}
                <ul className="max-w-work space-y-8 divide-y divide-rule [&>li+li]:pt-8">
                  {member.articles.map((article) => (
                    <li key={article.id} className="min-w-0">
                      <BArticle article={article} links={links} />
                    </li>
                  ))}
                </ul>
              </BProfileRow>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}

/** 라벨 한 줄 + 내용. 아래에 얇은 선을 그어 다음 항목과 나눈다. */
function BProfileRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="grid gap-2 py-7 sm:grid-cols-[10rem_1fr] sm:gap-8 lg:py-8">
        {/*
          절 제목. 17단계에서 한 단계 키웠다. 0.625rem 은 본문 옆에서 거의 읽히지 않아
          절이 어디서 나뉘는지 보이지 않았다. 굵은 선을 더 긋는 대신 글자만 손봤다.
          (B안은 상자 대신 얇은 선으로 나누는 것이 원칙이다)
        */}
        <dt className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/55 uppercase">
          {label}
        </dt>
        {/* 관리자가 입력한 글이다. HTML 로 렌더링하지 않는다. */}
        <dd className="max-w-[62ch] min-w-0 text-[0.9375rem] leading-[1.9] text-ink/80">
          {children}
        </dd>
      </div>
      <BRule />
    </div>
  );
}

/** 줄 단위 항목을 목록으로. 글머리표는 화면이 그린다. */
function BProfileList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.85em] h-px w-3 shrink-0 bg-rule-2"
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * 전문분야.
 *
 * 항목이 전부 짧으면 낱말 형태로 늘어놓는 편이 B안 지면에 어울린다.
 * 다만 관리자가 문장을 적어 넣을 수도 있으므로, **하나라도 길면 목록으로 되돌린다.**
 * 긴 글을 조각 안에 넣으면 여러 줄로 접혀 모양이 무너진다.
 *
 * ## 왜 밝은 알약이 아니라 어두운 조각인가 (17단계)
 *
 * 전에는 옅은 테두리만 두른 알약이라 A안과 거의 같아 보였다. B안의 지면은
 * 종이색 바탕에 얇은 선뿐이어서 **어딘가 한 곳은 색이 앉아야** 지면이 산다.
 * midnight 바탕에 bronze 글자를 얹어 그 자리를 여기로 잡았다.
 *
 * 모서리는 알약이 아니라 `rounded-sm` 이다. 완전한 알약은 누르는 것처럼 보인다.
 * **아무 동작도 하지 않으므로** hover·그림자·손가락 커서를 주지 않는다.
 */
const EXPERTISE_CHIP_MAX = 30;

function BExpertise({ items }: { items: string[] }) {
  const fitsChips = items.every((item) => item.length <= EXPERTISE_CHIP_MAX);
  if (!fitsChips) return <BProfileList items={items} />;

  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="max-w-full rounded-sm bg-midnight px-3 py-1.5 text-[0.75rem] font-semibold tracking-[0.08em] break-words text-bronze-2"
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
 * A안은 카드에 담지만 B안은 상자를 쓰지 않는다. **세로로 긴 표지 자리**를 왼쪽에
 * 세우고 오른쪽에 작은 대문자 표시 → 세리프 제목 → 저자 → 서지 → 소개 → 링크를
 * 흘린다. 프로필의 다른 항목(학력·경력)과 같은 규칙이라 저서가 "덧붙인 기능" 처럼
 * 따로 놀지 않고 지면의 마지막 절로 이어진다.
 *
 * 표지가 없을 때 회색 사각형을 그리지 않는다. `BBookCover` 가 그 자리를 채운다.
 */
function BBook({
  book,
  labels,
  links,
}: {
  book: FacultyBookView;
  labels: FacultyContent["labels"];
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex min-w-0 flex-col gap-6 sm:flex-row sm:gap-8">
      <div className="w-24 shrink-0 sm:w-32">
        {/* 비율과 잘림은 `BFrame` 이 정한다. 여기서는 겹쳐 놓을 자리만 만든다. */}
        <div className="relative shadow-[0_10px_30px_-12px_rgba(11,20,36,0.55)]">
          <BFrame media={book.cover} ratio="3/4" sizes="128px" />
          {!book.cover && <BBookCover book={book} />}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-[0.625rem] font-semibold tracking-[0.24em] text-bronze uppercase">
          {labels.bookEyebrow}
        </p>

        <h4 className="font-serif text-xl leading-snug font-bold break-words text-ink sm:text-2xl">
          {book.title}
        </h4>

        {book.subtitle && (
          <p className="text-sm leading-snug break-words text-ink/65">
            {book.subtitle}
          </p>
        )}

        <div className="flex flex-col gap-1">
          {book.author && (
            <p className="text-sm font-semibold break-words text-ink/80">
              {book.author}
            </p>
          )}
          {book.imprint && (
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] break-words text-quiet uppercase">
              {book.imprint}
            </p>
          )}
        </div>

        {book.description && (
          <p className="max-w-[52ch] text-sm leading-[1.85] break-words text-ink/75">
            {book.description}
          </p>
        )}

        {book.url && (
          <BExternalLink
            href={book.url}
            label={links.book}
            context={book.title}
            newTab={links.newTab}
          />
        )}
      </div>
    </article>
  );
}

/**
 * 표지가 없을 때 그 자리를 채우는 면. (16단계)
 *
 * `BFrame` 이 이미 midnight 바탕과 격자·워드마크를 깔아 두었다.
 * 그 위에 **가는 bronze 선 · 제목 · 발행연도**만 얹는다. 표지 그림을 흉내내지 않는다.
 * 실제 책 표지로 오해되면 안 된다.
 *
 * 오른쪽 칸에 이미 `저서` 표시가 붙어 있어 여기서 그 말을 되풀이하지 않는다.
 * (A안 `BookCoverPlaceholder` 와 같은 판단)
 *
 * 옆 칸에 같은 내용이 이미 글자로 있으므로 전체를 `aria-hidden` 으로 숨긴다.
 */
function BBookCover({ book }: { book: FacultyBookView }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-3 py-4 text-center"
    >
      <span className="h-px w-6 shrink-0 bg-bronze-2" />

      {/* `line-clamp` 은 display 를 -webkit-box 로 바꾼다. 정렬은 바깥에서 건다. */}
      <span className="line-clamp-4 font-serif text-xs leading-tight font-bold break-words text-white/90">
        {book.title}
      </span>

      {book.year && (
        <span className="text-[0.5rem] font-semibold tracking-[0.18em] text-white/40">
          {book.year}
        </span>
      )}
    </span>
  );
}

/**
 * 기사 한 건. (16단계에서 배치를 다시 잡았다)
 *
 * **단순 링크 목록처럼 보이지 않게** 게시처와 게시일을 맨 위에 세우고 제목을
 * 세리프로 크게 둔다. 항목 사이는 상자가 아니라 얇은 선으로만 나눈다. B안의 규칙이다.
 *
 * 제목 · 게시처 · 게시일 · 짧은 소개 · 원문 링크까지만이다.
 * **기사 본문도, 기사에 실린 사진도 가져오지 않는다.** (CLAUDE.md 22항)
 * 사용권이 확인된 이미지가 등록된 경우에만 가로 이미지가 위에 붙는다.
 */
function BArticle({
  article,
  links,
}: {
  article: FacultyArticleView;
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      {article.image && (
        <div className="relative mb-1 aspect-[16/9] w-full max-w-sm overflow-hidden">
          <Image
            src={article.image.url}
            alt={article.image.alt}
            fill
            sizes="(min-width: 640px) 24rem, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {(article.publisher || article.publishedOn) && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] font-semibold tracking-[0.2em] uppercase">
          {article.publisher && (
            <span className="break-words text-bronze">{article.publisher}</span>
          )}
          {article.publisher && article.publishedOn && (
            <span aria-hidden="true" className="h-3 w-px bg-rule-2" />
          )}
          {article.publishedOn && (
            <span className="break-words text-quiet">{article.publishedOn}</span>
          )}
        </p>
      )}

      <h4 className="font-serif text-xl leading-snug font-bold break-words text-ink sm:text-2xl">
        {article.title}
      </h4>

      {article.summary && (
        <p className="max-w-[52ch] text-sm leading-[1.85] break-words text-ink/75">
          {article.summary}
        </p>
      )}

      {article.url && (
        <BExternalLink
          href={article.url}
          label={isYouTubeUrl(article.url) ? links.youtube : links.article}
          context={article.title}
          newTab={links.newTab}
        />
      )}
    </article>
  );
}

/**
 * 원문으로 나가는 링크.
 *
 * `href` 에는 조회 단계에서 `toSafeUrl()` 을 통과한 http(s) 주소만 들어온다.
 * 새 탭이므로 `rel="noopener noreferrer"` 를 함께 둔다.
 * "도서 보기" 같은 짧은 문구가 목록에서 여러 번 반복되므로, 무엇의 링크이고
 * 새 창으로 열린다는 사실을 숨긴 글자로 덧붙인다.
 */
function BExternalLink({
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
      className="mt-1 inline-flex w-fit items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.2em] text-bronze uppercase underline-offset-[6px] hover:underline"
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
