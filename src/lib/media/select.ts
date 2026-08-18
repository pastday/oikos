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
