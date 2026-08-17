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
import { facultyTypeLabels, PublishBadge, Th, Td } from "@/components/admin/cms-ui";

export const metadata: Metadata = {
  title: "교수진 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 교수진 목록.
 *
 * 교수 수가 많지 않아 페이지네이션을 두지 않는다.
 * 표시순서 → 이름 순으로 전부 보여주는 편이 관리하기 쉽다.
 */
export default async function AdminFacultyListPage() {
  await requireAdmin();

  const rows = await prisma.faculty.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameKo: "asc" }],
    select: {
      id: true,
      type: true,
      nameKo: true,
      nameEn: true,
      titleKo: true,
      sortOrder: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="교수진"
        description="홈페이지 교수진 페이지와 메인의 주임교수 영역에 표시됩니다."
      >
        <Link
          href="/admin/faculty/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          교수 추가
        </Link>
      </AdminPageHeader>

      {rows.length === 0 ? (
        <EmptyState message="등록된 교수진이 없습니다." />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">교수진 목록</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>순서</Th>
                <Th>구분</Th>
                <Th>한국어 이름</Th>
                <Th>영어 이름</Th>
                <Th>직책</Th>
                <Th>공개</Th>
                <Th>수정일</Th>
                <Th>
                  <span className="sr-only">수정</span>
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
                  <Td className="whitespace-nowrap">
                    {facultyTypeLabels[row.type]}
                  </Td>
                  <Td className="font-semibold whitespace-nowrap text-navy">
                    {row.nameKo}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {row.nameEn ?? <EmptyValue />}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {row.titleKo ?? <EmptyValue />}
                  </Td>
                  <Td>
                    <PublishBadge isPublished={row.isPublished} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    <DateTimeText value={row.updatedAt} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Link
                      href={`/admin/faculty/${row.id}/edit`}
                      className="font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      수정
                      <span className="sr-only"> — {row.nameKo}</span>
                    </Link>
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
