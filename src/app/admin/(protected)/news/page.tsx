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
  newsCategoryLabels,
} from "@/components/admin/cms-ui";
import { formatDateOnly } from "@/lib/admin/format";
import { deleteNews } from "../news-actions";

export const metadata: Metadata = {
  title: "학교소식 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 학교소식 목록. (학교소식 지시 6항)
 *
 * 공개 페이지와 **같은 정렬 기준**(게시일 최신순)으로 보여 준다.
 * 관리자 화면에서 본 순서와 홈페이지 순서가 다르면 혼란스럽다.
 */
export default async function AdminNewsListPage() {
  await requireAdmin();

  const rows = await prisma.newsPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      titleKo: true,
      titleEn: true,
      category: true,
      publishedAt: true,
      isPublished: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="학교소식"
        description="홈페이지 [학교소식] 메뉴(/news)에 표시됩니다. 교수 개인의 외부 언론보도는 [교수진] 에서 따로 관리합니다."
      >
        <Link
          href="/admin/news/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          새 소식 등록
        </Link>
      </AdminPageHeader>

      {rows.length === 0 ? (
        <EmptyState message="등록된 학교소식이 없습니다." />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">학교소식 목록</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>제목</Th>
                <Th>카테고리</Th>
                <Th>게시일</Th>
                <Th>영어</Th>
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
                      /news/{row.slug}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {newsCategoryLabels[row.category]}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {formatDateOnly(row.publishedAt)}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {row.titleEn ? "입력됨" : "미입력"}
                  </Td>
                  <Td>
                    <PublishBadge isPublished={row.isPublished} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/news/${row.id}/edit`}
                        className="font-semibold text-navy underline-offset-4 hover:underline"
                      >
                        수정
                        <span className="sr-only"> — {row.titleKo}</span>
                      </Link>
                      <DeleteForm
                        action={deleteNews}
                        id={row.id}
                        confirmMessage={`이 학교소식을 삭제하시겠습니까?\n\n${row.titleKo}`}
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
