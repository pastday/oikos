import { prisma } from "@/lib/prisma";
import type { MediaOption } from "@/components/admin/MediaPicker";

/**
 * 미디어 선택 UI 에 넘길 이미지 목록.
 *
 * **PDF 는 빼고 이미지만 돌려준다.** 사진 자리에 PDF 를 고를 수 있으면
 * 화면에 깨진 이미지가 뜬다. 선택 단계에서 아예 보이지 않게 하는 편이 낫다.
 *
 * 이미지 수가 많지 않아 전부 넘긴다. 늘어나면 검색·페이지를 붙인다.
 */
export async function getImageOptions(): Promise<MediaOption[]> {
  const rows = await prisma.media.findMany({
    where: { mimeType: { startsWith: "image/" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, path: true, originalName: true, altKo: true },
  });

  return rows.map((row) => ({
    id: row.id,
    url: row.path,
    originalName: row.originalName,
    altKo: row.altKo,
  }));
}
