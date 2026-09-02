import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import {
  DeleteForm,
  PublishBadge,
  Th,
  Td,
  resourceCategoryLabels,
} from "@/components/admin/cms-ui";
import { formatDateOnly } from "@/lib/admin/format";
import { deleteResource } from "../resource-actions";

export const metadata: Metadata = {
  title: "자료실 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 자료실 목록. (자료실 지시 10항)
 * 공개 페이지와 같은 정렬(게시일 최신순).
 */
export default async function AdminResourceListPage() {
  await requireAdmin();

  const rows = await prisma.resourcePost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      titleKo: true,
      category: true,
      publishedAt: true,
      isPublished: true,
      _count: { select: { attachments: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="자료실"
        description="홈페이지 [자료실] 메뉴(/resources)에 표시됩니다. [입학 관련 서식] 카테고리는 입학안내 페이지 하단에도 자동 노출됩니다."
      >
        <Link
          href="/admin/resources/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          새 자료 등록
        </Link>
      </AdminPageHeader>

      {rows.length === 0 ? (
        <EmptyState message="등록된 자료가 없습니다." />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">자료실 목록</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>제목</Th>
                <Th>카테고리</Th>
                <Th>게시일</Th>
                <Th>첨부</Th>
                <Th>공개</Th>
                <Th>
                  <span className="sr-only">수정 및 삭제</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 hover:bg-surface"
                >
                  <Td className="max-w-md font-semibold text-navy">
                    {row.titleKo}
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      /resources/{row.slug}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {resourceCategoryLabels[row.category]}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {formatDateOnly(row.publishedAt)}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {row._count.attachments}개
                  </Td>
                  <Td>
                    <PublishBadge isPublished={row.isPublished} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/resources/${row.id}/edit`}
                        className="font-semibold text-navy underline-offset-4 hover:underline"
                      >
                        수정
                        <span className="sr-only"> — {row.titleKo}</span>
                      </Link>
                      <DeleteForm
                        action={deleteResource}
                        id={row.id}
                        confirmMessage={`이 자료를 삭제하시겠습니까?\n\n${row.titleKo}`}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
