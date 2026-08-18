import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyValue } from "@/components/admin/ui";
import { PublishBadge, Th, Td } from "@/components/admin/cms-ui";
import { AdmissionNumbersForm } from "@/components/admin/AdmissionNumbersForm";
import {
  ADMISSION_PAGE_KEY,
  admissionNumberKeys,
  findPage,
} from "@/lib/cms/page-catalog";
import { saveAdmissionNumbers } from "../../cms-actions";

export const metadata: Metadata = {
  title: "페이지 콘텐츠 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ pageKey: string }> };

/**
 * 한 페이지의 섹션 목록.
 *
 * 목록은 **카탈로그 순서**로 그린다. 그 순서가 공개 페이지에 나오는 순서와 같아서
 * 관리자가 화면을 위에서 아래로 훑으며 찾을 수 있다.
 * 아직 저장한 적 없는 섹션도 "미작성" 으로 함께 보여 준다. 빠진 것을 알 수 있어야 한다.
 *
 * 입학안내(`admission`)일 때만 위에 등록금·수수료 수치 편집을 함께 그린다.
 * 섹션 편집 화면은 다른 페이지와 완전히 같은 것을 쓴다. 화면을 두 벌 만들지 않는다.
 */
export default async function AdminPageSectionsPage({ params }: PageProps) {
  await requireAdmin();

  const { pageKey } = await params;
  const page = findPage(pageKey);
  if (!page) notFound();

  const rows = await prisma.pageSection.findMany({
    where: { pageKey },
    select: {
      sectionKey: true,
      titleKo: true,
      isPublished: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  const byKey = new Map(rows.map((row) => [row.sectionKey, row]));

  const isAdmission = pageKey === ADMISSION_PAGE_KEY;

  const numbers = isAdmission
    ? await prisma.siteSetting.findMany({
        where: { key: { in: admissionNumberKeys } },
        select: { key: true, value: true },
      })
    : [];

  const numberValues: Record<string, number | null> = {};
  if (isAdmission) {
    for (const key of admissionNumberKeys) numberValues[key] = null;
    for (const row of numbers) {
      const parsed = Number(row.value?.trim());
      numberValues[row.key] =
        row.value?.trim() && Number.isFinite(parsed) ? parsed : null;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={page.label} description={page.description}>
        <Link
          href={`/ko${page.path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          페이지 보기 ↗
        </Link>
      </AdminPageHeader>

      {isAdmission && (
        <AdmissionNumbersForm
          action={saveAdmissionNumbers}
          values={numberValues}
        />
      )}

      <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">{page.label} 섹션 목록</caption>
          <thead>
            <tr className="border-b border-line bg-surface text-left">
              <Th>섹션</Th>
              <Th>제목</Th>
              <Th>항목</Th>
              <Th>표시</Th>
              <Th>수정일</Th>
              <Th>
                <span className="sr-only">수정</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {page.sections.map((section) => {
              const row = byKey.get(section.key);

              return (
                <tr
                  key={section.key}
                  className="border-b border-line last:border-b-0 hover:bg-surface"
                >
                  <Td>
                    <span className="font-semibold text-navy">
                      {section.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {section.description}
                    </span>
                  </Td>
                  <Td>{row?.titleKo ?? <EmptyValue />}</Td>
                  <Td className="whitespace-nowrap text-muted">
                    {section.items ? `${row?._count.items ?? 0}개` : "—"}
                  </Td>
                  <Td>
                    {row ? (
                      <PublishBadge isPublished={row.isPublished} />
                    ) : (
                      <span className="inline-flex shrink-0 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-muted">
                        미작성
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {row ? (
                      new Intl.DateTimeFormat("ko-KR", {
                        dateStyle: "medium",
                        timeZone: "Asia/Seoul",
                      }).format(row.updatedAt)
                    ) : (
                      <EmptyValue />
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Link
                      href={`/admin/pages/${page.key}/${section.key}`}
                      className="font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      수정
                      <span className="sr-only"> — {section.label}</span>
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
