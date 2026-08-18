import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DateTimeText,
  EmptyState,
  EmptyValue,
} from "@/components/admin/ui";
import { DeleteForm, PublishBadge, Th, Td } from "@/components/admin/cms-ui";
import { deleteFaq } from "../cms-actions";

export const metadata: Metadata = {
  title: "FAQ | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * FAQ 목록.
 *
 * 공개 페이지와 **같은 정렬 기준**(표시순서 → 등록순)으로 보여 준다.
 * 관리자 화면에서 본 순서와 홈페이지 순서가 다르면 정렬을 맞추기 어렵다.
 * 항목이 많지 않아 페이지네이션은 두지 않는다.
 */
export default async function AdminFaqListPage() {
  await requireAdmin();

  const rows = await prisma.fAQ.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="FAQ"
        description="홈페이지 FAQ 페이지에 표시됩니다. 페이지 상단 문구는 [페이지 콘텐츠 → FAQ 페이지 안내문] 에서 수정합니다."
      >
        <Link
          href="/admin/faq/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          질문 추가
        </Link>
      </AdminPageHeader>

      {rows.length === 0 ? (
        <EmptyState message="등록된 FAQ 가 없습니다." />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">FAQ 목록</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>순서</Th>
                <Th>질문 (한국어)</Th>
                <Th>영어</Th>
                <Th>공개</Th>
                <Th>수정일</Th>
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
                  <Td className="text-muted">{row.sortOrder}</Td>
                  <Td className="max-w-lg font-semibold text-navy">
                    {row.questionKo}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {row.questionEn ? "입력됨" : <EmptyValue text="미입력" />}
                  </Td>
                  <Td>
                    <PublishBadge isPublished={row.isPublished} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    <DateTimeText value={row.updatedAt} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/faq/${row.id}/edit`}
                        className="font-semibold text-navy underline-offset-4 hover:underline"
                      >
                        수정
                        <span className="sr-only"> — {row.questionKo}</span>
                      </Link>
                      <DeleteForm
                        action={deleteFaq}
                        id={row.id}
                        confirmMessage={`이 FAQ 를 삭제합니다. 되돌릴 수 없습니다.\n\n${row.questionKo}`}
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
