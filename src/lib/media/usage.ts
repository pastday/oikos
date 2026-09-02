import { prisma } from "@/lib/prisma";
import { findPage, findSection } from "@/lib/cms/page-catalog";

/**
 * 이 파일이 어디에서 쓰이고 있는지 찾는다.
 *
 * 삭제하기 전에 확인해서, 화면에 걸려 있는 파일을 실수로 지워
 * 깨진 이미지나 404 링크가 생기는 일을 막는다. **cascade 로 지우지 않는다.**
 * 쓰던 쪽을 먼저 정리하게 하는 편이 안전하고, 무엇이 사라지는지도 분명해진다.
 *
 * ## 두 겹으로 막는다
 *
 * 1. 이 함수 — 관리자에게 **어디서 쓰는지 알려 주고** 삭제를 거절한다.
 * 2. DB 의 `onDelete: Restrict` — 이 검사를 지나쳐도 참조가 끊기지 않는다.
 *
 * 1번만 있으면 검사를 빠뜨린 경로가 생겼을 때 조용히 깨진다.
 * 2번만 있으면 막히긴 하는데 관리자는 이유를 알 수 없다. 둘 다 필요하다.
 *
 * ## 사용처가 늘면
 *
 * 여기에 조회를 추가한다. 12단계부터 참조는 전부 **Media id** 기준이다.
 * (11단계의 `Faculty.photoUrl` 문자열 방식은 `photoMediaId` 참조로 바뀌었다)
 */

export type MediaUsage = {
  /** 관리자에게 보여 줄 사용처 이름 */
  label: string;
  /** 바로 고치러 갈 수 있는 관리자 경로 */
  href: string;
  /**
   * 이 파일이 나오는 **공개 페이지의 라우트 패턴**.
   *
   * 대체 텍스트를 고쳤을 때 어디를 다시 만들어야 하는지 여기서 알아낸다.
   * 사용처를 아는 곳에서 함께 적어 두어야 화면이 옛 내용을 보여주는 일이 없다.
   * (실제 주소가 아니라 패턴이어야 무효화가 동작한다. `revalidate.ts` 주석 참고)
   */
  paths: string[];
};

/** 섹션을 관리자가 아는 이름으로 부른다. 카탈로그에 없으면 키를 그대로 쓴다. */
function describeSection(pageKey: string, sectionKey: string): string {
  const found = findSection(pageKey, sectionKey);
  if (found) return `${found.page.label} — ${found.section.label}`;

  const page = findPage(pageKey);
  return `${page?.label ?? pageKey} — ${sectionKey}`;
}

export async function findMediaUsage(mediaId: string): Promise<MediaUsage[]> {
  const [
    faculty,
    sectionImages,
    sectionDocuments,
    items,
    newsCovers,
    newsAttachments,
  ] = await Promise.all([
    prisma.faculty.findMany({
      where: { photoMediaId: mediaId },
      select: { id: true, nameKo: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.pageSection.findMany({
      where: { mediaId },
      select: { pageKey: true, sectionKey: true },
    }),
    prisma.pageSection.findMany({
      where: { documentMediaId: mediaId },
      select: { pageKey: true, sectionKey: true },
    }),
    prisma.pageSectionItem.findMany({
      where: { mediaId },
      select: {
        labelKo: true,
        section: { select: { pageKey: true, sectionKey: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.newsPost.findMany({
      where: { coverMediaId: mediaId },
      select: { id: true, titleKo: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.newsAttachment.findMany({
      where: { mediaId },
      select: { post: { select: { id: true, titleKo: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // 학교소식은 A안·B안 두 곳의 목록과 상세에 나온다. 대체 텍스트를 고치면 네 패턴을 다시 만든다.
  const NEWS_PATHS = [
    "/[locale]/(site)/news",
    "/[locale]/(site)/news/[slug]",
    "/[locale]/design-b/news",
    "/[locale]/design-b/news/[slug]",
  ];

  return [
    ...faculty.map((member) => ({
      label: `교수진 — ${member.nameKo}`,
      href: `/admin/faculty/${member.id}/edit`,
      // 교수 사진은 교수진 페이지와 메인(주임교수 영역) 두 곳에 나온다.
      paths: ["/[locale]", "/[locale]/faculty"],
    })),
    ...sectionImages.map((section) => ({
      label: `${describeSection(section.pageKey, section.sectionKey)} (대표 이미지)`,
      href: `/admin/pages/${section.pageKey}/${section.sectionKey}`,
      paths: [`/[locale]/${section.pageKey}`],
    })),
    ...sectionDocuments.map((section) => ({
      label: `${describeSection(section.pageKey, section.sectionKey)} (첨부 문서)`,
      href: `/admin/pages/${section.pageKey}/${section.sectionKey}`,
      paths: [`/[locale]/${section.pageKey}`],
    })),
    ...items.map((item) => ({
      label: `${describeSection(
        item.section.pageKey,
        item.section.sectionKey,
      )} — ${item.labelKo ?? "항목"}`,
      href: `/admin/pages/${item.section.pageKey}/${item.section.sectionKey}`,
      paths: [`/[locale]/${item.section.pageKey}`],
    })),
    ...newsCovers.map((post) => ({
      label: `학교소식 — ${post.titleKo} (대표 이미지)`,
      href: `/admin/news/${post.id}/edit`,
      paths: NEWS_PATHS,
    })),
    ...newsAttachments.map((attachment) => ({
      label: `학교소식 — ${attachment.post.titleKo} (첨부파일)`,
      href: `/admin/news/${attachment.post.id}/edit`,
      paths: NEWS_PATHS,
    })),
  ];
}
