import { prisma } from "@/lib/prisma";
import type { MediaKind } from "./validation";
import { kindFromMimeType } from "./validation";

/**
 * 관리자 화면의 **미디어 선택 목록**과 **서버 측 타입 검증**.
 *
 * 화면에서 이미지 칸에는 이미지만, 문서 칸에는 PDF 만 보여 준다.
 * 다만 그건 편의일 뿐이므로 **저장할 때 서버가 다시 확인한다.**
 * 브라우저를 거치지 않고 직접 요청을 보내 PDF 를 이미지 칸에 넣는 것을 막아야 한다.
 */

export type MediaChoice = {
  id: string;
  url: string;
  originalName: string;
  altKo: string | null;
  kind: MediaKind;
};

/** 모든 파일을 선택 목록으로. 학교소식 첨부처럼 이미지·PDF 를 함께 붙이는 곳에서 쓴다. */
export async function getAllMediaChoices(): Promise<MediaChoice[]> {
  const rows = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      path: true,
      originalName: true,
      altKo: true,
      mimeType: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    url: row.path,
    originalName: row.originalName,
    altKo: row.altKo,
    kind: kindFromMimeType(row.mimeType),
  }));
}

/**
 * 종류를 가리지 않고 **실제로 존재하는 Media id 만** 순서를 지켜 남긴다.
 *
 * 학교소식 첨부는 이미지·PDF 를 함께 받으므로 `resolveMediaId` 처럼 종류를 강제하지 않는다.
 * 없는 id 가 하나라도 섞여 있으면 액션이 저장을 거부할 수 있도록 개수도 함께 돌려준다.
 */
export async function resolveExistingMediaIds(
  ids: string[],
): Promise<{ ids: string[]; missing: number }> {
  const unique = [...new Set(ids.filter((id) => id.length > 0))];
  if (unique.length === 0) return { ids: [], missing: 0 };

  const rows = await prisma.media.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });

  const found = new Set(rows.map((row) => row.id));
  const kept = unique.filter((id) => found.has(id));
  return { ids: kept, missing: unique.length - kept.length };
}

/** 선택 목록. 종류로 걸러서 가져온다. */
export async function getMediaChoices(kind: MediaKind): Promise<MediaChoice[]> {
  const rows = await prisma.media.findMany({
    where:
      kind === "pdf"
        ? { mimeType: "application/pdf" }
        : { mimeType: { startsWith: "image/" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      path: true,
      originalName: true,
      altKo: true,
      mimeType: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    url: row.path,
    originalName: row.originalName,
    altKo: row.altKo,
    kind: kindFromMimeType(row.mimeType),
  }));
}

/**
 * 저장 전 검증.
 *
 * 빈 값은 "연결 없음" 이라는 정상적인 상태이므로 `null` 로 통과시킨다.
 * 값이 있으면 **실제로 존재하는 Media 인지**와 **요구한 종류가 맞는지**를 함께 본다.
 * 둘 중 하나라도 어긋나면 `"invalid"` 를 돌려주고 액션이 저장을 거부한다.
 *
 * 없는 id 를 저장하면 FK 제약 때문에 어차피 실패하지만, 그 경우 사용자에게는
 * 원인을 알 수 없는 오류로 보인다. 여기서 먼저 걸러 무엇이 잘못됐는지 알려 준다.
 */
export async function resolveMediaId(
  value: string | null,
  kind: MediaKind,
): Promise<string | null | "invalid"> {
  if (!value) return null;

  const media = await prisma.media.findUnique({
    where: { id: value },
    select: { id: true, mimeType: true },
  });

  if (!media) return "invalid";
  if (kindFromMimeType(media.mimeType) !== kind) return "invalid";

  return media.id;
}
