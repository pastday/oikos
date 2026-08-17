import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, DateTimeText, EmptyState, EmptyValue } from "@/components/admin/ui";
import { PublishBadge, Th, Td } from "@/components/admin/cms-ui";

export const metadata: Metadata = {
  title: "MBA · DBA 과정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 과정 목록.
 *
 * 이 사이트는 MBA / DBA 두 과정만 제공한다.
 * 그래서 **새 과정을 만들거나 지우는 기능을 두지 않고 수정만 가능하게 했다.**
 * 과정 종류를 늘리는 것은 화면 구성 전체에 영향을 주는 결정이라 CMS 로 처리할 일이 아니다.
 */
export default async function AdminProgramListPage() {
  await requireAdmin();

  const rows = await prisma.program.findMany({
    orderBy: { type: "asc" },
    select: {
      id: true,
      type: true,
      nameKo: true,
      nameEn: true,
      durationSemesters: true,
      totalCredits: true,
      isPublished: true,
      updatedAt: true,
      _count: { select: { courses: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="MBA · DBA 과정"
        description="과정 소개와 학기·학점 정보를 관리합니다. 이 값은 과정 상세뿐 아니라 입학안내와 FAQ 문구에도 반영됩니다."
      />

      {rows.length === 0 ? (
        <EmptyState message="등록된 과정이 없습니다. seed 스크립트를 먼저 실행해 주세요." />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">과정 목록</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>과정</Th>
                <Th>한국어 이름</Th>
                <Th>영어 이름</Th>
                <Th>학기</Th>
                <Th>총 학점</Th>
                <Th>교과목</Th>
                <Th>공개</Th>
                <Th>수정일</Th>
                <Th><span className="sr-only">수정</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-b-0 hover:bg-surface">
                  <Td className="font-semibold whitespace-nowrap text-navy">{row.type}</Td>
                  <Td className="whitespace-nowrap">{row.nameKo}</Td>
                  <Td className="whitespace-nowrap">{row.nameEn ?? <EmptyValue />}</Td>
                  <Td className="whitespace-nowrap">{row.durationSemesters ?? <EmptyValue />}</Td>
                  <Td className="whitespace-nowrap">{row.totalCredits ?? <EmptyValue />}</Td>
                  <Td className="whitespace-nowrap text-muted">{row._count.courses}과목</Td>
                  <Td><PublishBadge isPublished={row.isPublished} /></Td>
                  <Td className="whitespace-nowrap text-muted"><DateTimeText value={row.updatedAt} /></Td>
                  <Td className="whitespace-nowrap">
                    <Link
                      href={`/admin/programs/${row.type.toLowerCase()}`}
                      className="font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      수정<span className="sr-only"> — {row.type}</span>
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
