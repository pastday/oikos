"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { revalidateNews } from "@/lib/cms/revalidate";
import { slugifyNews, parseYouTubeId } from "@/lib/cms/news-shared";
import { toSafeUrl } from "@/lib/cms/types";
import { resolveExistingMediaIds, resolveMediaId } from "@/lib/media/select";
import {
  formDataToObject,
  newsSchema,
  newsLinkRowsSchema,
  CMS_GENERIC_ERROR,
  CMS_INVALID_ERROR,
  CMS_NOT_FOUND_ERROR,
  type CmsFormState,
} from "@/lib/cms/validation";
import type { NewsLinkType } from "@/generated/prisma/enums";
import type { ZodError } from "zod";

/**
 * 학교소식(`NewsPost`) CMS 의 저장 / 삭제.
 *
 * 다른 CMS 액션과 같은 규칙을 따른다.
 *  - **모든 액션이 시작할 때 `requireAdmin()` 을 호출한다.** 서버 액션은 layout 을
 *    거치지 않고 직접 호출될 수 있으므로 layout 인증을 믿지 않는다. (지시 20항)
 *  - 클라이언트가 보낸 필드를 그대로 Prisma 에 펼치지 않는다. zod 통과 값만 매핑한다.
 *  - 대표 이미지·첨부파일은 **기존 `Media` 를 재사용**한다. 새 파일 테이블을 만들지 않는다.
 *
 * REST API 를 따로 만들지 않는다. 이 프로젝트의 CMS 는 서버 액션 중심이다. (지시 21항)
 */

const MEDIA_IMAGE_ERROR =
  "대표 이미지를 찾을 수 없습니다. 올려 둔 이미지 중에서 선택해 주세요.";
const ATTACHMENT_ERROR =
  "첨부파일을 찾을 수 없습니다. 삭제된 파일이 연결되어 있는지 확인해 주세요.";
const SLUG_TAKEN_ERROR = "이미 사용 중인 주소입니다. 다른 주소를 입력해 주세요.";
const ARTICLE_LINK_ERROR =
  "관련 기사 링크를 확인해 주세요. 제목과 http(s) 주소를 모두 입력해야 합니다.";
const VIDEO_LINK_ERROR = "올바른 YouTube 주소를 입력해 주세요.";

function toErrorState(scope: string, error: unknown): CmsFormState {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "P2025") {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }
  // slug 유일 제약 위반. 정규화/suffix 로 거의 오지 않지만 경합 시 여기로 올 수 있다.
  if (code === "P2002") {
    return { status: "error", message: SLUG_TAKEN_ERROR, field: "slug" };
  }

  console.error(`[admin][cms][${scope}] 저장 실패`, error);
  return { status: "error", message: CMS_GENERIC_ERROR };
}

/** zod 실패 → 화면용 상태. 우리가 붙인 한국어 메시지를 그대로 쓰고 필드를 함께 넘긴다. */
function fromZodError(error: ZodError): CmsFormState {
  const issue = error.issues[0];
  const field =
    typeof issue?.path?.[0] === "string" ? issue.path[0] : undefined;
  return { status: "error", message: issue?.message ?? CMS_INVALID_ERROR, field };
}

/**
 * 자동 생성 slug 의 중복을 `-2`, `-3` … 로 피한다. 자기 자신(수정 중)은 제외한다.
 * (관리자가 직접 입력한 slug 는 이 함수를 쓰지 않는다 — 중복이면 오류로 알려 준다)
 */
async function resolveUniqueSlug(
  base: string,
  excludeId: string | null,
): Promise<string> {
  const normalized = base.length > 0 ? base : "news";
  let candidate = normalized;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.newsPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

/** JSON 배열 hidden input 을 파싱한다. 비어 있으면 `[]`, 형식이 깨졌으면 `null`. */
function parseLinkJson(formData: FormData, name: string): unknown[] | null {
  const raw = formData.get(name);
  if (typeof raw !== "string" || raw.trim().length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

type LinkRow = {
  type: NewsLinkType;
  titleKo: string;
  titleEn: string | null;
  url: string;
  sortOrder: number;
};

/**
 * 관련 링크(기사 · 동영상)를 검증해 저장할 행 배열로 만든다.
 * 문제가 있으면 `CmsFormState`(error) 를 돌려준다.
 */
function buildLinkRows(
  formData: FormData,
): { rows: LinkRow[] } | { error: CmsFormState } {
  const articleRaw = parseLinkJson(formData, "articleLinksJson");
  const videoRaw = parseLinkJson(formData, "videoLinksJson");
  if (articleRaw === null || videoRaw === null) {
    return { error: { status: "error", message: CMS_INVALID_ERROR } };
  }

  const articles = newsLinkRowsSchema.safeParse(articleRaw);
  if (!articles.success) {
    return {
      error: { status: "error", message: ARTICLE_LINK_ERROR, field: "articleLinks" },
    };
  }

  const videos = newsLinkRowsSchema.safeParse(videoRaw);
  if (!videos.success) {
    return {
      error: { status: "error", message: VIDEO_LINK_ERROR, field: "videoLinks" },
    };
  }

  // 기사 URL: 임의 스킴(javascript: 등)을 막는다. href 에 그대로 들어가는 값이다.
  for (const row of articles.data) {
    if (!toSafeUrl(row.url)) {
      return {
        error: { status: "error", message: ARTICLE_LINK_ERROR, field: "articleLinks" },
      };
    }
  }

  // 동영상 URL: 이번 단계는 YouTube 만 받는다. ID 를 뽑을 수 없으면 거절한다.
  for (const row of videos.data) {
    if (!parseYouTubeId(row.url)) {
      return {
        error: { status: "error", message: VIDEO_LINK_ERROR, field: "videoLinks" },
      };
    }
  }

  const rows: LinkRow[] = [
    ...articles.data.map((row, index) => ({
      type: "ARTICLE" as const,
      titleKo: row.titleKo,
      titleEn: row.titleEn,
      url: row.url,
      sortOrder: index,
    })),
    ...videos.data.map((row, index) => ({
      type: "VIDEO" as const,
      titleKo: row.titleKo,
      titleEn: row.titleEn,
      url: row.url,
      sortOrder: index,
    })),
  ];

  return { rows };
}

export async function saveNews(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = newsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  // 대표 이미지는 이미지 Media 만 연결할 수 있다. 없는 id 나 PDF 는 여기서 걸러진다.
  const coverMediaId = await resolveMediaId(parsed.data.coverMediaId, "image");
  if (coverMediaId === "invalid") {
    return { status: "error", message: MEDIA_IMAGE_ERROR, field: "coverMediaId" };
  }

  // 첨부파일은 종류를 가리지 않는다. 실제로 존재하는 파일만 순서대로 남긴다.
  const rawAttachmentIds = formData
    .getAll("attachmentMediaIds")
    .filter((value): value is string => typeof value === "string");
  const attachments = await resolveExistingMediaIds(rawAttachmentIds);
  if (attachments.missing > 0) {
    return { status: "error", message: ATTACHMENT_ERROR };
  }

  const linkResult = buildLinkRows(formData);
  if ("error" in linkResult) return linkResult.error;

  // slug — 무엇이 들어와도 정규화한다. 관리자가 규칙을 알 필요가 없다.
  const explicitSlug = parsed.data.slug !== null;
  let base = slugifyNews(
    parsed.data.slug ?? parsed.data.titleEn ?? parsed.data.titleKo,
  );
  if (base.length === 0) {
    base = slugifyNews(parsed.data.titleKo) || "news";
  }

  let slug: string;
  if (explicitSlug) {
    // 직접 입력한 주소는 그대로 존중한다. 겹치면 조용히 바꾸지 않고 오류로 알린다. (TEST 3)
    const existing = await prisma.newsPost.findUnique({
      where: { slug: base },
      select: { id: true },
    });
    if (existing && existing.id !== id) {
      return { status: "error", message: SLUG_TAKEN_ERROR, field: "slug" };
    }
    slug = base;
  } else {
    slug = await resolveUniqueSlug(base, id);
  }

  const data = {
    slug,
    titleKo: parsed.data.titleKo,
    titleEn: parsed.data.titleEn,
    summaryKo: parsed.data.summaryKo,
    summaryEn: parsed.data.summaryEn,
    contentKo: parsed.data.contentKo,
    contentEn: parsed.data.contentEn,
    category: parsed.data.category,
    publishedAt: parsed.data.publishedAt,
    isPublished: parsed.data.isPublished,
    coverMediaId,
  };

  const attachmentRows = attachments.ids.map((mediaId, index) => ({
    mediaId,
    sortOrder: index,
  }));

  try {
    if (id) {
      // 첨부·링크는 연결 행만 지우고 다시 만든다. Media 파일 자체는 건드리지 않는다. (지시 15항)
      await prisma.$transaction([
        prisma.newsAttachment.deleteMany({ where: { postId: id } }),
        prisma.newsLink.deleteMany({ where: { postId: id } }),
        prisma.newsPost.update({
          where: { id },
          data: {
            ...data,
            attachments: { create: attachmentRows },
            links: { create: linkResult.rows },
          },
        }),
      ]);
    } else {
      await prisma.newsPost.create({
        data: {
          ...data,
          attachments: { create: attachmentRows },
          links: { create: linkResult.rows },
        },
      });
    }
  } catch (error) {
    return toErrorState("news", error);
  }

  revalidateNews();

  // 새로 만든 경우에는 목록으로 보낸다. 같은 폼에 머무르면 중복 생성하기 쉽다.
  if (!id) redirect("/admin/news");

  return { status: "saved" };
}

export async function deleteNews(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  try {
    // NewsAttachment · NewsLink 는 onDelete: Cascade 라 연결 행만 함께 사라진다.
    // 대표 이미지·첨부파일의 Media 파일은 남는다. (다른 콘텐츠와 공유될 수 있다 — 지시 15항)
    await prisma.newsPost.delete({ where: { id } });
  } catch (error) {
    // 이미 지워졌거나 없는 id 여도 목록으로 돌아가면 된다.
    console.error("[admin][cms][news] 삭제 실패", error);
    return;
  }

  revalidateNews();
  redirect("/admin/news");
}
