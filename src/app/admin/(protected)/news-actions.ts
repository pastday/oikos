"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { revalidateNews } from "@/lib/cms/revalidate";
import { slugifyNews } from "@/lib/cms/news";
import { resolveExistingMediaIds, resolveMediaId } from "@/lib/media/select";
import {
  formDataToObject,
  firstIssueMessage,
  newsSchema,
  CMS_GENERIC_ERROR,
  CMS_NOT_FOUND_ERROR,
  type CmsFormState,
} from "@/lib/cms/validation";

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

function toErrorState(scope: string, error: unknown): CmsFormState {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "P2025") {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  console.error(`[admin][cms][${scope}] 저장 실패`, error);
  return { status: "error", message: CMS_GENERIC_ERROR };
}

/**
 * slug 를 확정한다.
 *
 * 관리자가 입력한 값이 있으면 그것을, 없으면 한국어 제목에서 만든다.
 * 이미 쓰이는 slug 면 뒤에 `-2`, `-3` … 을 붙여 비운다. 자기 자신(수정 중)은 제외한다.
 */
async function resolveUniqueSlug(
  base: string,
  excludeId: string | null,
): Promise<string> {
  const normalized = base.length > 0 ? base : "news";
  let candidate = normalized;
  let suffix = 2;

  // 최악의 경우에도 유한하다. slug 는 유일 인덱스라 언젠가는 빈 값을 찾는다.
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

export async function saveNews(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = newsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  // 대표 이미지는 이미지 Media 만 연결할 수 있다. 없는 id 나 PDF 는 여기서 걸러진다.
  const coverMediaId = await resolveMediaId(parsed.data.coverMediaId, "image");
  if (coverMediaId === "invalid") {
    return { status: "error", message: MEDIA_IMAGE_ERROR };
  }

  // 첨부파일은 종류를 가리지 않는다. 실제로 존재하는 파일만 순서대로 남긴다.
  const rawAttachmentIds = formData
    .getAll("attachmentMediaIds")
    .filter((value): value is string => typeof value === "string");
  const attachments = await resolveExistingMediaIds(rawAttachmentIds);
  if (attachments.missing > 0) {
    return { status: "error", message: ATTACHMENT_ERROR };
  }

  const slug = await resolveUniqueSlug(
    parsed.data.slug ?? slugifyNews(parsed.data.titleKo),
    id,
  );

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
      // 첨부는 연결 행만 지우고 다시 만든다. Media 파일 자체는 건드리지 않는다. (지시 15항)
      await prisma.$transaction([
        prisma.newsAttachment.deleteMany({ where: { postId: id } }),
        prisma.newsPost.update({
          where: { id },
          data: { ...data, attachments: { create: attachmentRows } },
        }),
      ]);
    } else {
      await prisma.newsPost.create({
        data: { ...data, attachments: { create: attachmentRows } },
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
    // NewsAttachment 는 onDelete: Cascade 라 연결 행만 함께 사라진다.
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
