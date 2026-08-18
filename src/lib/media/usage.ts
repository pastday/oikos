import { prisma } from "@/lib/prisma";

/**
 * 이 파일이 어디에서 쓰이고 있는지 찾는다.
 *
 * 삭제하기 전에 확인해서, 화면에 걸려 있는 이미지를 실수로 지워
 * 깨진 이미지가 뜨는 일을 막는다. **cascade 로 지우지 않는다.**
 * 쓰던 쪽을 먼저 정리하게 하는 편이 안전하고, 무엇이 사라지는지도 분명해진다.
 *
 * 사용처가 늘면 이 파일에 검사를 추가한다.
 * 지금은 `Faculty.photoUrl` 하나뿐이다. (`PageSection` 에는 아직 이미지 필드가 없다)
 */

export type MediaUsage = {
  /** 관리자에게 보여 줄 사용처 이름 */
  label: string;
  /** 바로 고치러 갈 수 있는 관리자 경로 */
  href: string;
};

export async function findMediaUsage(url: string): Promise<MediaUsage[]> {
  const faculty = await prisma.faculty.findMany({
    where: { photoUrl: url },
    select: { id: true, nameKo: true },
    orderBy: { sortOrder: "asc" },
  });

  return faculty.map((member) => ({
    label: `교수진 — ${member.nameKo}`,
    href: `/admin/faculty/${member.id}/edit`,
  }));
}
