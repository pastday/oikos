"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { revalidateResources } from "@/lib/cms/revalidate";
import { slugifyNews } from "@/lib/cms/news-shared";
import { resolveExistingMediaIds } from "@/lib/media/select";
import {
  formDataToObject,
  resourceSchema,
  CMS_GENERIC_ERROR,
  CMS_INVALID_ERROR,
  CMS_NOT_FOUND_ERROR,
  type CmsFormState,
} from "@/lib/cms/validation";
import type { ZodError } from "zod";

/**
 * 자료실(`ResourcePost`) CMS 의 저장 / 삭제.
 *
 * 학교소식(`news-actions.ts`)과 같은 규칙·같은 helper 를 쓴다. (자료실 지시 12·13항)
 *  - 모든 액션 시작 시 `requireAdmin()`.
 *  - slug 는 `slugifyNews` 로 정규화. 비면 제목에서 자동 생성, 겹치면 자동 suffix,
 *    직접 입력한 값이 겹치면 오류로 알린다.
 *  - 첨부파일은 **기존 `Media` 재사용**. 새 파일 테이블을 만들지 않는다.
 */

const ATTACHMENT_ERROR =
  "첨부파일을 찾을 수 없습니다. 삭제된 파일이 연결되어 있는지 확인해 주세요.";
const SLUG_TAKEN_ERROR = "이미 사용 중인 주소입니다. 다른 주소를 입력해 주세요.";

function toErrorState(error: unknown): CmsFormState {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "P2025") {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }
  if (code === "P2002") {
    return { status: "error", message: SLUG_TAKEN_ERROR, field: "slug" };
  }

  console.error("[admin][cms][resource] 저장 실패", error);
  return { status: "error", message: CMS_GENERIC_ERROR };
}

function fromZodError(error: ZodError): CmsFormState {
  const issue = error.issues[0];
  const field =
    typeof issue?.path?.[0] === "string" ? issue.path[0] : undefined;
  return { status: "error", message: issue?.message ?? CMS_INVALID_ERROR, field };
}

/** 자동 생성 slug 의 중복을 `-2`, `-3` … 로 피한다. 자기 자신(수정 중)은 제외한다. */
async function resolveUniqueSlug(
  base: string,
  excludeId: string | null,
): Promise<string> {
  const normalized = base.length > 0 ? base : "resource";
  let candidate = normalized;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.resourcePost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

export async function saveResource(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = resourceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  const rawAttachmentIds = formData
    .getAll("attachmentMediaIds")
    .filter((value): value is string => typeof value === "string");
  const attachments = await resolveExistingMediaIds(rawAttachmentIds);
  if (attachments.missing > 0) {
    return { status: "error", message: ATTACHMENT_ERROR, field: "attachments" };
  }

  // slug — 무엇이 들어와도 정규화한다. (학교소식과 동일 정책)
  const explicitSlug = parsed.data.slug !== null;
  let base = slugifyNews(
    parsed.data.slug ?? parsed.data.titleEn ?? parsed.data.titleKo,
  );
  if (base.length === 0) base = slugifyNews(parsed.data.titleKo) || "resource";

  let slug: string;
  if (explicitSlug) {
    const existing = await prisma.resourcePost.findUnique({
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
    category: parsed.data.category,
    titleKo: parsed.data.titleKo,
    titleEn: parsed.data.titleEn,
    summaryKo: parsed.data.summaryKo,
    summaryEn: parsed.data.summaryEn,
    contentKo: parsed.data.contentKo,
    contentEn: parsed.data.contentEn,
    publishedAt: parsed.data.publishedAt,
    isPublished: parsed.data.isPublished,
  };

  const attachmentRows = attachments.ids.map((mediaId, index) => ({
    mediaId,
    sortOrder: index,
  }));

  try {
    if (id) {
      // 첨부는 연결 행만 지우고 다시 만든다. Media 파일 자체는 건드리지 않는다. (지시 22항)
      await prisma.$transaction([
        prisma.resourceAttachment.deleteMany({ where: { postId: id } }),
        prisma.resourcePost.update({
          where: { id },
          data: { ...data, attachments: { create: attachmentRows } },
        }),
      ]);
    } else {
      await prisma.resourcePost.create({
        data: { ...data, attachments: { create: attachmentRows } },
      });
    }
  } catch (error) {
    return toErrorState(error);
  }

  revalidateResources();

  if (!id) redirect("/admin/resources");

  return { status: "saved" };
}

export async function deleteResource(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  try {
    // ResourceAttachment 는 onDelete: Cascade 라 연결 행만 함께 사라진다.
    // 첨부파일의 Media 파일 자체는 남는다. (지시 22·23항)
    await prisma.resourcePost.delete({ where: { id } });
  } catch (error) {
    console.error("[admin][cms][resource] 삭제 실패", error);
    return;
  }

  revalidateResources();
  redirect("/admin/resources");
}
