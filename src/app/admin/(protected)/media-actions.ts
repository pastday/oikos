"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  createStoredName,
  resolveStoredPath,
  storedFilePath,
  uploadDir,
} from "@/lib/media/storage";
import { mediaUrl } from "@/lib/media/url";
import { validateUpload } from "@/lib/media/validation";
import { findMediaUsage } from "@/lib/media/usage";
import {
  formDataToObject,
  CMS_GENERIC_ERROR,
  CMS_INVALID_ERROR,
  CMS_NOT_FOUND_ERROR,
  mediaAltSchema,
  type CmsFormState,
} from "@/lib/cms/validation";

/**
 * 미디어 업로드 · 수정 · 삭제.
 *
 * 다른 CMS 액션과 같은 규칙을 따른다.
 * **모든 액션이 시작할 때 `requireAdmin()` 을 호출한다.** 서버 액션은 layout 을
 * 거치지 않고 직접 호출될 수 있으므로 layout 인증을 믿지 않는다.
 *
 * 여기서만 파일시스템에 쓴다. 저장 경로는 서버가 만들고,
 * **클라이언트가 보낸 값은 경로 결정에 전혀 쓰이지 않는다.**
 */

function toErrorState(scope: string, error: unknown): CmsFormState {
  console.error(`[admin][media][${scope}] 실패`, error);
  return { status: "error", message: CMS_GENERIC_ERROR };
}

// ---------------------------------------------------------------------------
// 업로드
// ---------------------------------------------------------------------------

/**
 * 파일 하나를 저장하고 Media 행을 만든다.
 *
 * ## 파일과 DB 가 어긋나지 않게 하는 순서
 *
 * 파일시스템에는 트랜잭션이 없으므로 순서로 방어한다.
 *
 *   1. 검증  → 통과 못 하면 아무것도 만들지 않는다
 *   2. 파일 저장
 *   3. DB insert → **실패하면 방금 쓴 파일을 지운다**
 *
 * 이 순서면 "DB 에는 있는데 파일이 없는" 상태가 생기지 않는다.
 * 반대 방향(파일은 있는데 DB 에 없는 고아 파일)은 3번의 정리가 또 실패할 때만 남고,
 * 그 파일은 이름을 아는 사람이 없어 노출되지 않는다. 로그로 남겨 나중에 치울 수 있게 한다.
 */
export async function uploadMedia(
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { status: "error", message: "파일을 선택해 주세요." };
  }

  const validated = await validateUpload(file);
  if (!validated.ok) {
    return { status: "error", message: validated.message };
  }

  const alt = mediaAltSchema.safeParse(formDataToObject(formData));
  if (!alt.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  const storedName = createStoredName(validated.type.extension);
  const filePath = storedFilePath(storedName);

  try {
    await mkdir(uploadDir, { recursive: true });
    // wx: 이미 있는 파일을 덮어쓰지 않는다. UUID 라 부딪힐 일이 없지만,
    // 부딪힌다면 그건 사고이므로 조용히 덮어쓰는 것보다 실패하는 편이 낫다.
    await writeFile(filePath, validated.bytes, { flag: "wx" });
  } catch (error) {
    // 운영에서 가장 흔한 원인은 systemd 의 ProtectHome=read-only 다.
    // (ReadWritePaths 에 업로드 디렉터리가 없으면 여기서 EROFS/EACCES 가 난다)
    console.error("[admin][media][upload] 파일 저장 실패", error);
    return {
      status: "error",
      message:
        "파일을 저장하지 못했습니다. 업로드 디렉터리 쓰기 권한을 확인해 주세요.",
    };
  }

  try {
    await prisma.media.create({
      data: {
        originalName: file.name.slice(0, 255),
        storedName,
        mimeType: validated.type.mimeType,
        size: file.size,
        path: mediaUrl(storedName),
        altKo: alt.data.altKo,
        altEn: alt.data.altEn,
      },
    });
  } catch (error) {
    // DB 에 못 넣었으면 방금 쓴 파일도 되돌린다. 고아 파일을 남기지 않는다.
    try {
      await unlink(filePath);
    } catch (cleanupError) {
      console.error(
        `[admin][media][upload] 고아 파일 정리 실패: ${storedName}`,
        cleanupError,
      );
    }

    return toErrorState("upload", error);
  }

  redirect("/admin/media");
}

// ---------------------------------------------------------------------------
// 대체 텍스트 수정
// ---------------------------------------------------------------------------

/** 파일 자체는 바꾸지 않는다. 바꾸려면 새로 올린다. */
export async function saveMediaAlt(
  id: string,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = mediaAltSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  let url: string;

  try {
    const updated = await prisma.media.update({
      where: { id },
      data: parsed.data,
      select: { path: true },
    });
    url = updated.path;
  } catch (error) {
    return toErrorState("alt", error);
  }

  // 이 이미지를 쓰는 공개 화면이 있으면 다시 만든다.
  // 지금은 교수 사진뿐이라 사용처를 찾아 해당하는 경우에만 무효화한다.
  const usage = await findMediaUsage(url);
  if (usage.length > 0) {
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/faculty", "page");
  }

  return { status: "saved" };
}

// ---------------------------------------------------------------------------
// 삭제
// ---------------------------------------------------------------------------

/**
 * 파일과 DB 행을 함께 지운다.
 *
 * ## 사용 중이면 지우지 않는다
 *
 * 교수 사진으로 걸려 있는 파일을 지우면 공개 페이지에 깨진 이미지가 뜬다.
 * 그래서 먼저 사용처를 찾고, 있으면 **거절하고 어디서 쓰는지 알려 준다.**
 *
 * ## 지우는 순서
 *
 *   1. 사용처 확인 → 있으면 중단
 *   2. DB 행 삭제
 *   3. 파일 삭제 → 실패해도 이미 DB 가 없으므로 화면에는 나타나지 않는다
 *
 * 업로드와 반대 순서다. 업로드는 "DB 에 있는데 파일이 없는" 상태를 막아야 하고,
 * 삭제는 그 상태를 만들지 않으면서 끝나야 하기 때문이다.
 * 3번이 실패하면 아무도 참조하지 않는 파일만 디스크에 남는다.
 * 이름을 아는 사람이 없어 노출되지 않으며, 로그를 보고 수동으로 지우면 된다.
 */
export async function deleteMedia(
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  const media = await prisma.media.findUnique({
    where: { id },
    select: { storedName: true, path: true, originalName: true },
  });

  if (!media) {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  const usage = await findMediaUsage(media.path);
  if (usage.length > 0) {
    return {
      status: "error",
      message: `사용 중이라 삭제할 수 없습니다. 먼저 연결을 해제해 주세요. (${usage
        .map((item) => item.label)
        .join(", ")})`,
    };
  }

  try {
    await prisma.media.delete({ where: { id } });
  } catch (error) {
    return toErrorState("delete", error);
  }

  const filePath = resolveStoredPath(media.storedName);

  if (filePath) {
    try {
      await unlink(filePath);
    } catch (error) {
      // 이미 없는 파일이면 목적은 달성된 것이다. 그 밖의 오류만 기록한다.
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: unknown }).code
          : undefined;

      if (code !== "ENOENT") {
        console.error(
          `[admin][media][delete] 파일 삭제 실패 (DB 행은 지워졌다): ${media.storedName}`,
          error,
        );
      }
    }
  }

  redirect("/admin/media");
}
