import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { contentPages } from "@/lib/cms/page-catalog";

export const metadata: Metadata = {
  title: "페이지 콘텐츠 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 페이지 콘텐츠 목록.
 *
 * 어떤 페이지가 있는지는 카탈로그가 정한다. DB 를 훑어 목록을 만들지 않는다.
 * 아직 한 번도 저장하지 않은 페이지도 목록에 나와야 하기 때문이다.
 * 입학안내는 등록금 수치까지 함께 다루는 전용 메뉴가 있어 여기서는 뺀다.
 */
export default async function AdminPagesListPage() {
  await requireAdmin();

  const saved = await prisma.pageSection.groupBy({
    by: ["pageKey"],
    _count: { _all: true },
  });

  const savedCount = new Map(saved.map((row) => [row.pageKey, row._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="페이지 콘텐츠"
        description="공개 페이지의 제목·본문·안내문을 수정합니다. 페이지의 구성과 디자인은 바뀌지 않습니다."
      />

      <ul className="grid gap-4 lg:grid-cols-2">
        {contentPages.map((page) => {
          const count = savedCount.get(page.key) ?? 0;

          return (
            <li key={page.key}>
              <Link
                href={`/admin/pages/${page.key}`}
                className="flex h-full flex-col rounded-lg border border-line bg-background p-6 transition-colors hover:border-navy"
              >
                <span className="text-base font-semibold text-navy">
                  {page.label}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted">
                  {page.description}
                </span>
                <span className="mt-4 text-xs text-muted">
                  섹션 {page.sections.length}개
                  {count === 0 && " · 아직 저장된 내용이 없습니다"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
