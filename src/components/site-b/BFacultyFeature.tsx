import Image from "next/image";
import type { ReactNode } from "react";
import type { FacultyContent } from "@/content/pages";
import {
  hasFacultyProfile,
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
          <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.22em] text-bronze uppercase">
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
                <ul className="space-y-8">
                  {member.books.map((book) => (
                    <li key={book.id}>
                      <BBook book={book} links={links} />
                    </li>
                  ))}
                </ul>
              </BProfileRow>
            )}

            {showAll && member.articles.length > 0 && (
              <BProfileRow label={labels.articles}>
                <ul className="space-y-7">
                  {member.articles.map((article) => (
                    <li key={article.id}>
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
      <div className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
        <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
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
 * 긴 글을 알약 모양 안에 넣으면 여러 줄로 접혀 모양이 무너진다.
 */
const EXPERTISE_CHIP_MAX = 30;

function BExpertise({ items }: { items: string[] }) {
  const fitsChips = items.every((item) => item.length <= EXPERTISE_CHIP_MAX);
  if (!fitsChips) return <BProfileList items={items} />;

  return (
    <ul className="flex flex-wrap gap-x-2.5 gap-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="max-w-full rounded-full border border-rule-2 px-3.5 py-1 text-[0.8125rem] break-words text-ink/75"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * 저서 한 권. (15단계)
 *
 * A안은 작은 카드에 담지만 B안은 상자를 쓰지 않는다. **세로로 긴 표지 자리**를
 * 왼쪽에 세우고 오른쪽에 글을 흘린다. 다른 항목과 같은 규칙이다.
 *
 * 표지가 없을 때 회색 사각형을 그리지 않는다. `BFrame` 이 만드는 면 위에 제목을
 * 세로로 앉혀 **책등처럼** 보이게 한다. 그 글자는 옆의 제목과 같은 내용이라
 * 화면 읽기 프로그램에서는 숨긴다.
 */
function BBook({
  book,
  links,
}: {
  book: FacultyBookView;
  links: FacultyContent["externalLinks"];
}) {
  return (
    <article className="flex min-w-0 gap-6 sm:gap-8">
      <div className="w-20 shrink-0 sm:w-28">
        {/* 비율과 잘림은 `BFrame` 이 정한다. 여기서는 겹쳐 놓을 자리만 만든다. */}
        <div className="relative">
          <BFrame media={book.cover} ratio="3/4" sizes="112px" />

          {!book.cover && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-serif text-[0.6875rem] leading-tight font-bold break-words text-white/80"
            >
              {book.title}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h4 className="font-serif text-lg leading-snug font-bold break-words text-ink">
          {book.title}
        </h4>

        {book.subtitle && (
          <p className="text-sm leading-snug break-words text-ink/70">
            {book.subtitle}
          </p>
        )}

        {book.meta && (
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] break-words text-quiet uppercase">
            {book.meta}
          </p>
        )}

        {book.description && (
          <p className="max-w-[52ch] text-sm leading-[1.8] break-words text-ink/75">
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
 * 기사 한 건. (15단계)
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
    <article className="flex min-w-0 flex-col gap-2">
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

      <h4 className="font-serif text-lg leading-snug font-bold break-words text-ink">
        {article.title}
      </h4>

      {article.meta && (
        <p className="text-[0.6875rem] font-semibold tracking-[0.14em] break-words text-quiet uppercase">
          {article.meta}
        </p>
      )}

      {article.summary && (
        <p className="max-w-[52ch] text-sm leading-[1.8] break-words text-ink/75">
          {article.summary}
        </p>
      )}

      {article.url && (
        <BExternalLink
          href={article.url}
          label={links.article}
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
