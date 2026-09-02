import { cache } from "react";
import type { ResourceCategory } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { extensionLabel } from "@/lib/media/url";
import { pickLocale, pickLocaleOptional, toParagraphs } from "./types";
// 날짜·용량 표기와 slug 규칙은 학교소식에서 이미 만든 것을 그대로 쓴다. (자료실 지시 12항)
import { formatNewsDate, toNewsDateAttr } from "./news";

export { slugifyNews } from "./news-shared";
export { formatAttachmentSize } from "./news";

/**
 * 자료실(`ResourcePost`) 공개 화면용 조회 · 표현.
 *
 * ## 학교소식과의 관계
 *
 * 완전히 별개 모델·화면이다. (자료실 지시 27항) 다만 slug 정규화·날짜 표기·첨부 용량
 * 표기는 성격이 같아 학교소식 helper 를 재사용한다. 새 함수를 만들지 않는다.
 *
 * ## 한/영 처리
 *
 * 한국어 제목만 필수. 나머지는 비면 `pickLocale(Optional)` 이 한국어로 fallback 하거나
 * `null` 을 돌려주고 화면이 그 부분을 그리지 않는다. (학교소식과 동일)
 */

// ---------------------------------------------------------------------------
// 카테고리 표시 문구
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<Locale, Record<ResourceCategory, string>> = {
  ko: {
    ADMISSION: "입학 관련 서식",
    GUIDE: "모집요강",
    ACADEMIC: "학사 자료",
    OTHER: "기타 자료",
  },
  en: {
    ADMISSION: "Admission Forms",
    GUIDE: "Admission Guide",
    ACADEMIC: "Academic Resources",
    OTHER: "Other",
  },
};

export function resourceCategoryLabel(
  locale: Locale,
  category: ResourceCategory,
): string {
  return CATEGORY_LABELS[locale][category];
}

// ---------------------------------------------------------------------------
// View 형태
// ---------------------------------------------------------------------------

export type ResourceAttachmentView = {
  id: string;
  /** 표시·다운로드 파일명 (원본, 한글 가능) */
  name: string;
  /** 다운로드 URL. `?dl` 이 붙어 있어 브라우저가 첨부로 내려받는다. */
  downloadUrl: string;
  /** 확장자 라벨. 예: "PDF" · "DOCX" · "HWP" */
  ext: string;
  /** KB/MB 표기용 바이트 수 */
  size: number;
};

export type ResourceListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: ResourceCategory;
  categoryLabel: string;
  publishedOn: string;
  publishedAtAttr: string;
  attachmentCount: number;
};

export type ResourceDetail = ResourceListItem & {
  /** 본문/설명 문단. 빈 줄로 나눈다. 없으면 빈 배열 */
  paragraphs: string[];
  attachments: ResourceAttachmentView[];
};

/** 입학안내 페이지 하단에 넣을 "입학 관련 서식" 한 줄. */
export type AdmissionResourceItem = {
  id: string;
  slug: string;
  title: string;
  attachmentCount: number;
  /** 첨부가 정확히 1개일 때만 채워진다. 바로 다운로드 버튼을 그린다. (지시 17항) */
  singleAttachment: ResourceAttachmentView | null;
};

// ---------------------------------------------------------------------------
// 조회
// ---------------------------------------------------------------------------

function toAttachmentView(row: {
  id: string;
  media: { path: string; storedName: string; originalName: string; size: number };
}): ResourceAttachmentView {
  return {
    id: row.id,
    name: row.media.originalName,
    // `/media/<uuid>.<ext>?dl` — 라우트가 Content-Disposition: attachment 로 내려보낸다.
    downloadUrl: `${row.media.path}?dl`,
    ext: extensionLabel(row.media.storedName),
    size: row.media.size,
  };
}

/** 첨부파일 조회 인자. 학교소식과 같은 정렬 규칙. */
const attachmentsArgs = {
  orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  select: {
    id: true,
    media: {
      select: {
        path: true,
        storedName: true,
        originalName: true,
        size: true,
      },
    },
  },
};

function toListItem(
  locale: Locale,
  row: {
    id: string;
    slug: string;
    titleKo: string;
    titleEn: string | null;
    summaryKo: string | null;
    summaryEn: string | null;
    category: ResourceCategory;
    publishedAt: Date;
    _count: { attachments: number };
  },
): ResourceListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: pickLocale(locale, row.titleKo, row.titleEn),
    summary: pickLocaleOptional(locale, row.summaryKo, row.summaryEn),
    category: row.category,
    categoryLabel: resourceCategoryLabel(locale, row.category),
    publishedOn: formatNewsDate(locale, row.publishedAt),
    publishedAtAttr: toNewsDateAttr(row.publishedAt),
    attachmentCount: row._count.attachments,
  };
}

/**
 * 공개된 자료 목록. 최신 등록(게시일) 먼저. 게시일이 같으면 `createdAt` 으로 안정 정렬.
 */
export const getPublishedResourceList = cache(
  async (locale: Locale): Promise<ResourceListItem[]> => {
    const rows = await prisma.resourcePost.findMany({
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
        _count: { select: { attachments: true } },
      },
    });

    return rows.map((row) => toListItem(locale, row));
  },
);

/** 공개된 자료 한 건. 비공개거나 없으면 `null` → 화면이 404. */
export const getPublishedResourcePost = cache(
  async (slug: string, locale: Locale): Promise<ResourceDetail | null> => {
    const row = await prisma.resourcePost.findFirst({
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
        _count: { select: { attachments: true } },
        attachments: attachmentsArgs,
      },
    });

    if (!row) return null;

    return {
      ...toListItem(locale, row),
      paragraphs: toParagraphs(
        pickLocaleOptional(locale, row.contentKo, row.contentEn),
      ),
      attachments: row.attachments.map(toAttachmentView),
    };
  },
);

/**
 * 입학안내 페이지 하단의 "입학 관련 서류 다운로드". (자료실 지시 16항)
 * `category = ADMISSION` 이고 공개된 자료만 최신순으로.
 */
export const getAdmissionResources = cache(
  async (locale: Locale): Promise<AdmissionResourceItem[]> => {
    const rows = await prisma.resourcePost.findMany({
      where: { isPublished: true, category: "ADMISSION" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        titleKo: true,
        titleEn: true,
        _count: { select: { attachments: true } },
        attachments: attachmentsArgs,
      },
    });

    return rows.map((row) => {
      const attachments = row.attachments.map(toAttachmentView);
      return {
        id: row.id,
        slug: row.slug,
        title: pickLocale(locale, row.titleKo, row.titleEn),
        attachmentCount: row._count.attachments,
        singleAttachment: attachments.length === 1 ? attachments[0] : null,
      };
    });
  },
);
