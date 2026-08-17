import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DateTimeText,
  EmptyState,
  EmptyValue,
  FilterGroup,
  Pagination,
  StatusBadge,
} from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/SearchBox";
import { localeLabels, truncate } from "@/lib/admin/format";
import {
  buildListHref,
  buildSearchFilter,
  getPagination,
  inquiryStatuses,
  parseInquiryListQuery,
  seminarStatusLabels,
  type RawSearchParams,
} from "@/lib/admin/inquiry";
import { locales } from "@/i18n/config";

/**
 * 설명회 신청 목록.
 *
 * 구조는 입학상담 목록과 같지만 보여줄 항목이 다르다. (참석 인원, 희망 설명회)
 * 표를 만들어 주는 공통 컴포넌트를 억지로 만들지 않고 각자 나열한다.
 */

export const metadata: Metadata = {
  title: "설명회 신청 | Oikos 관리자",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/admin/seminars";

type PageProps = { searchParams: Promise<RawSearchParams> };

export default async function SeminarListPage({ searchParams }: PageProps) {
  await requireAdmin();

  const raw = await searchParams;
  const query = parseInquiryListQuery(raw);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.locale ? { locale: query.locale } : {}),
    ...buildSearchFilter(query.q),
  };

  const totalCount = await prisma.seminarApplication.count({ where });
  const pagination = getPagination(query.page, query.pageSize, totalCount);

  const rows = await prisma.seminarApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.pageSize,
    select: {
      id: true,
      createdAt: true,
      name: true,
      phone: true,
      email: true,
      preferredSession: true,
      attendeeCount: true,
      locale: true,
      status: true,
    },
  });

  const href = (overrides: Parameters<typeof buildListHref>[2]): string =>
    buildListHref(BASE_PATH, query, overrides);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="설명회 신청"
        description="홈페이지에서 접수된 설명회 참석 신청입니다. 최근 신청이 위에 표시됩니다."
      />

      <section
        aria-label="검색 및 필터"
        className="flex flex-col gap-4 rounded-lg border border-line bg-background px-5 py-4"
      >
        <SearchBox
          basePath={BASE_PATH}
          defaultValue={query.q ?? ""}
          hiddenFields={{ status: query.status, locale: query.locale }}
        />

        <FilterGroup
          label="상태"
          options={[
            {
              href: href({ status: undefined, page: undefined }),
              label: "전체",
              active: !query.status,
            },
            ...inquiryStatuses.map((status) => ({
              href: href({ status, page: undefined }),
              label: seminarStatusLabels[status],
              active: query.status === status,
            })),
          ]}
        />

        <FilterGroup
          label="신청 언어"
          options={[
            {
              href: href({ locale: undefined, page: undefined }),
              label: "전체",
              active: !query.locale,
            },
            ...locales.map((locale) => ({
              href: href({ locale, page: undefined }),
              label: localeLabels[locale] ?? locale,
              active: query.locale === locale,
            })),
          ]}
        />
      </section>

      {rows.length === 0 ? (
        <EmptyState
          message={
            totalCount === 0 && !query.q && !query.status && !query.locale
              ? "접수된 설명회 신청이 없습니다."
              : "조건에 맞는 설명회 신청이 없습니다."
          }
        />
      ) : (
        <section className="flex flex-col gap-4">
          {/* `relative` 는 표 안의 sr-only(absolute) 요소가 스크롤 컨테이너를 벗어나지 않게 한다. */}
          <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
            <table className="w-full min-w-[56rem] border-collapse text-sm">
              <caption className="sr-only">설명회 신청 목록</caption>
              <thead>
                <tr className="border-b border-line bg-surface text-left">
                  <Th>신청일</Th>
                  <Th>이름</Th>
                  <Th>연락처</Th>
                  <Th>이메일</Th>
                  <Th>희망 설명회</Th>
                  <Th>참석 인원</Th>
                  <Th>언어</Th>
                  <Th>상태</Th>
                  <Th>
                    <span className="sr-only">상세</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-surface"
                  >
                    <Td className="whitespace-nowrap text-muted">
                      <DateTimeText value={row.createdAt} />
                    </Td>
                    <Td className="font-semibold whitespace-nowrap text-navy">
                      {row.name}
                    </Td>
                    <Td className="whitespace-nowrap">{row.phone}</Td>
                    <Td className="whitespace-nowrap">{row.email}</Td>
                    <Td className="max-w-[16rem] text-muted">
                      {truncate(row.preferredSession, 32) || <EmptyValue />}
                    </Td>
                    <Td className="whitespace-nowrap">{row.attendeeCount}명</Td>
                    <Td className="whitespace-nowrap text-muted">
                      {localeLabels[row.locale] ?? row.locale}
                    </Td>
                    <Td>
                      <StatusBadge
                        status={row.status}
                        label={seminarStatusLabels[row.status]}
                      />
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Link
                        href={`${BASE_PATH}/${row.id}`}
                        className="font-semibold text-navy underline-offset-4 hover:underline"
                      >
                        상세보기
                        <span className="sr-only"> — {row.name}</span>
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            hrefFor={(page) =>
              href({ page: page > 1 ? String(page) : undefined })
            }
          />
        </section>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-muted"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>
  );
}
