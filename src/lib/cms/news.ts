import { cache } from "react";
import type { NewsCategory } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import {
  pickLocale,
  pickLocaleOptional,
  toMediaView,
  toParagraphs,
  type MediaView,
} from "./types";

/**
 * 학교소식(`NewsPost`) 공개 화면용 조회 · 표현.
 *
 * ## 교수 언론·미디어와의 관계
 *
 * 이 파일은 **학교 단위 소식**만 다룬다. 교수 개인의 외부 기사(`FacultyArticle`)는
 * `lib/cms/queries.ts` 가 교수 상세에서만 읽는다. 두 기능은 서로를 참조하지 않는다.
 * (학교소식 지시 16항)
 *
 * ## 한/영 처리
 *
 * 제목·본문은 항상 값이 있다. (한국어 필수) 영문이 비어 있으면 `pickLocale` 이
 * 한국어를 그대로 돌려준다. 요약처럼 없을 수 있는 값은 `pickLocaleOptional` 로
 * `null` 이 되고 화면이 그 부분을 그리지 않는다. 없는 번역을 지어내지 않는다.
 *
 * ## 캐시
 *
 * 공개 페이지는 정적으로 유지되고 관리자가 저장할 때만 `revalidateNews()` 로
 * 다시 만들어진다. 그래서 이 함수들은 빌드·재생성 시점에만 실행된다.
 * 같은 렌더 안에서 여러 번 불려도 한 번만 조회하도록 React `cache` 로 감싼다.
 */

// ---------------------------------------------------------------------------
// 카테고리 표시 문구
// ---------------------------------------------------------------------------

/**
 * 공개 화면의 카테고리 라벨. DB enum 값을 언어별 표시 문구로 바꾼다.
 * enum 을 늘리면 여기도 함께 채운다. (관리자 화면 라벨은 `components/admin/cms-ui.tsx`)
 */
const CATEGORY_LABELS: Record<Locale, Record<NewsCategory, string>> = {
  ko: {
    NOTICE: "공지",
    EVENT: "행사",
    ACADEMIC: "학사",
    MEDIA: "미디어",
    OTHER: "기타",
  },
  en: {
    NOTICE: "Notice",
    EVENT: "Event",
    ACADEMIC: "Academic",
    MEDIA: "Media",
    OTHER: "Other",
  },
};

export function newsCategoryLabel(
  locale: Locale,
  category: NewsCategory,
): string {
  return CATEGORY_LABELS[locale][category];
}

// ---------------------------------------------------------------------------
// 날짜 표시
// ---------------------------------------------------------------------------

const enNewsDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * 게시일 표시. 한국어 `2026.09.15`, 영문 `Sep 15, 2026`.
 *
 * `publishedAt` 은 `@db.Date` 라 시각이 없다. **`UTC` 로 고정**해서 읽는다.
 * 서버 시간대에 따라 해석하면 자정 근처 값이 하루 밀려 보인다.
 * (`FacultyArticle` 의 `formatPublishedDate` 와 같은 이유이며, 형식만 학교소식용이다)
 */
export function formatNewsDate(locale: Locale, value: Date): string {
  if (locale === "ko") {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }
  return enNewsDateFormatter.format(value);
}

/** `<time datetime>` 에 넣을 값. 날짜만 있는 값이라 `YYYY-MM-DD` 로 자른다. */
export function toNewsDateAttr(value: Date): string {
  return value.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// View 형태
// ---------------------------------------------------------------------------

export type NewsListItem = {
  id: string;
  slug: string;
  /** 현재 locale 기준 제목 */
  title: string;
  /** 요약. 없으면 null 이고 화면이 생략한다. */
  summary: string | null;
  category: NewsCategory;
  categoryLabel: string;
  /** 사람이 읽는 형식으로 이미 맞춰진 게시일 */
  publishedOn: string;
  /** `<time datetime>` 용 (YYYY-MM-DD) */
  publishedAtAttr: string;
  /** 대표 이미지. 없으면 null 이고 화면이 이미지 영역을 생략한다. */
  cover: MediaView | null;
};

export type NewsAttachmentView = {
  id: string;
  /** 표시·다운로드 파일명 */
  name: string;
  /** 공개 URL (`/media/<uuid>.<ext>`) */
  url: string;
  /** KB/MB 표기에 쓰는 바이트 수 */
  size: number;
};

export type NewsDetail = NewsListItem & {
  /** 본문 문단. 빈 줄로 나눈다. 없으면 빈 배열 */
  paragraphs: string[];
  attachments: NewsAttachmentView[];
};

// ---------------------------------------------------------------------------
// 조회
// ---------------------------------------------------------------------------

const mediaSelect = {
  path: true,
  altKo: true,
  altEn: true,
  originalName: true,
  size: true,
} as const;

function toListItem(
  locale: Locale,
  row: {
    id: string;
    slug: string;
    titleKo: string;
    titleEn: string | null;
    summaryKo: string | null;
    summaryEn: string | null;
    category: NewsCategory;
    publishedAt: Date;
    cover: {
      path: string;
      altKo: string | null;
      altEn: string | null;
      originalName: string;
      size: number;
    } | null;
  },
): NewsListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: pickLocale(locale, row.titleKo, row.titleEn),
    summary: pickLocaleOptional(locale, row.summaryKo, row.summaryEn),
    category: row.category,
    categoryLabel: newsCategoryLabel(locale, row.category),
    publishedOn: formatNewsDate(locale, row.publishedAt),
    publishedAtAttr: toNewsDateAttr(row.publishedAt),
    cover: toMediaView(locale, row.cover),
  };
}

/**
 * 공개된 학교소식 목록. **최신 게시물이 먼저** 온다.
 * `publishedAt` 이 같으면 `createdAt` 으로 안정적으로 정렬한다.
 */
export const getPublishedNewsList = cache(
  async (locale: Locale): Promise<NewsListItem[]> => {
    const rows = await prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        titleKo: true,
        titleEn: true,
        summaryKo: true,
        summaryEn: true,
        category: true,
        publishedAt: true,
        cover: { select: mediaSelect },
      },
    });

    return rows.map((row) => toListItem(locale, row));
  },
);

/**
 * 공개된 학교소식 한 건. 비공개거나 없으면 `null` 이고 화면이 404 로 처리한다.
 */
export const getPublishedNewsPost = cache(
  async (slug: string, locale: Locale): Promise<NewsDetail | null> => {
    const row = await prisma.newsPost.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        titleKo: true,
        titleEn: true,
        summaryKo: true,
        summaryEn: true,
        contentKo: true,
        contentEn: true,
        category: true,
        publishedAt: true,
        cover: { select: mediaSelect },
        attachments: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            media: {
              select: { path: true, originalName: true, size: true },
            },
          },
        },
      },
    });

    if (!row) return null;

    return {
      ...toListItem(locale, row),
      paragraphs: toParagraphs(
        pickLocaleOptional(locale, row.contentKo, row.contentEn),
      ),
      attachments: row.attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.media.originalName,
        url: attachment.media.path,
        size: attachment.media.size,
      })),
    };
  },
);

/** 첨부파일 용량 표기. 1KB 미만도 최소 1 KB 로 적는다. (`MediaBlocks` 와 같은 규칙) */
export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// slug
// ---------------------------------------------------------------------------

/**
 * 제목에서 URL slug 를 만든다.
 *
 * 문자(한글 포함)와 숫자만 남기고 나머지는 `-` 로 바꾼다.
 * 한글 slug 는 브라우저가 percent-encoding 해서 정상 동작하며, 국내 사이트에서 흔하다.
 * 관리자가 직접 입력한 slug 가 있으면 그 값을 그대로 쓰므로, 이건 자동 생성 fallback 이다.
 */
export function slugifyNews(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
