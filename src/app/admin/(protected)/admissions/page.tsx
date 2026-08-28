import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DateTimeText,
  EmptyState,
  FilterGroup,
  Pagination,
  StatusBadge,
} from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/SearchBox";
import { getPagination } from "@/lib/admin/inquiry";
import {
  admissionProgramTypes,
  admissionStatusLabels,
  admissionStatuses,
  buildAdmissionListHref,
  buildAdmissionSearchFilter,
  parseAdmissionListQuery,
} from "@/lib/admin/admission";

/**
 * 입학신청 목록. (18단계)
 *
 * 필터·검색·페이지를 전부 URL 쿼리로 다루는 것은 상담 목록과 같다.
 * 관리자가 특정 조건의 화면을 북마크할 수 있고 뒤로가기가 자연스럽다.
 *
 * ⚠️ **주민등록번호 컬럼은 조회하지 않는다.** 목록에 쓸 일이 없고,
 * 읽지 않는 것이 가장 확실한 노출 차단이다. (지시 8·34항)
 */

export const metadata: Metadata = {
  title: "입학신청 | Oikos 관리자",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/admin/admissions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdmissionListPage({ searchParams }: PageProps) {
  await requireAdmin();

  const query = parseAdmissionListQuery(await searchParams);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.program ? { program: query.program } : {}),
    ...buildAdmissionSearchFilter(query.q),
  };

  const totalCount = await prisma.admissionApplication.count({ where });
  const pagination = getPagination(query.page, query.pageSize, totalCount);

  const rows = await prisma.admissionApplication.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    skip: pagination.skip,
    take: pagination.pageSize,
    select: {
      id: true,
      applicationNo: true,
      nameKo: true,
      nameEn: true,
      program: true,
      admissionYear: true,
      admissionTerm: true,
      submittedAt: true,
      status: true,
    },
  });

  const href = (
    overrides: Parameters<typeof buildAdmissionListHref>[2],
  ): string => buildAdmissionListHref(BASE_PATH, query, overrides);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="입학신청"
        description="홈페이지에서 접수된 온라인 입학신청입니다. 최근 신청이 위에 표시됩니다."
      />

      <div className="flex flex-col gap-4 rounded-lg border border-line bg-background px-5 py-4">
        <SearchBox
          basePath={BASE_PATH}
          defaultValue={query.q ?? ""}
          hiddenFields={{ status: query.status, program: query.program }}
          placeholder="이름, 접수번호 검색"
        />

        <FilterGroup
          label="상태"
          options={[
            {
              href: href({ status: undefined, page: undefined }),
              label: "전체",
              active: !query.status,
            },
            ...admissionStatuses.map((status) => ({
              href: href({ status, page: undefined }),
              label: admissionStatusLabels[status],
              active: query.status === status,
            })),
          ]}
        />

        <FilterGroup
          label="과정"
          options={[
            {
              href: href({ program: undefined, page: undefined }),
              label: "전체",
              active: !query.program,
            },
            ...admissionProgramTypes.map((program) => ({
              href: href({ program, page: undefined }),
              label: program,
              active: query.program === program,
            })),
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState message="조건에 맞는 입학신청이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-3 font-semibold">접수번호</th>
                <th className="px-4 py-3 font-semibold">이름</th>
                <th className="px-4 py-3 font-semibold">과정</th>
                <th className="px-4 py-3 font-semibold">제출일</th>
                <th className="px-4 py-3 font-semibold">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 hover:bg-surface"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`${BASE_PATH}/${row.id}`}
                      className="font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      {row.applicationNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground/85">
                      {row.nameKo}
                    </span>
                    <span className="ml-2 text-xs text-muted">{row.nameEn}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground/85">
                    {row.program}
                    <span className="ml-2 text-xs text-muted">
                      {row.admissionYear}{" "}
                      {row.admissionTerm === "SPRING" ? "봄" : "가을"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <DateTimeText value={row.submittedAt} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.status}
                      label={admissionStatusLabels[row.status]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        pagination={pagination}
        hrefFor={(page) => href({ page: page > 1 ? String(page) : undefined })}
      />
    </div>
  );
}
