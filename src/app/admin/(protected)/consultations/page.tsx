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
  consultationStatusLabels,
  getPagination,
  inquiryStatuses,
  parseInquiryListQuery,
  programTypes,
  type RawSearchParams,
} from "@/lib/admin/inquiry";
import { locales } from "@/i18n/config";

/**
 * 입학상담 목록.
 *
 * 필터·검색·페이지는 전부 URL 쿼리로 다룬다.
 * 그래야 관리자가 특정 조건의 화면을 북마크하거나 공유할 수 있고, 뒤로가기가 자연스럽다.
 * 대시보드의 카드도 이 쿼리로 바로 연결된다.
 */

export const metadata: Metadata = {
  title: "입학상담 | Oikos 관리자",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/admin/consultations";

type PageProps = { searchParams: Promise<RawSearchParams> };

export default async function ConsultationListPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const raw = await searchParams;
  const query = parseInquiryListQuery(raw);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.program ? { interestedProgram: query.program } : {}),
    ...(query.locale ? { locale: query.locale } : {}),
    ...buildSearchFilter(query.q),
  };

  const totalCount = await prisma.consultation.count({ where });
  const pagination = getPagination(query.page, query.pageSize, totalCount);

  const rows = await prisma.consultation.findMany({
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
      interestedProgram: true,
      message: true,
      locale: true,
      status: true,
    },
  });

  const href = (
    overrides: Parameters<typeof buildListHref>[2],
  ): string => buildListHref(BASE_PATH, query, overrides);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="입학상담"
        description="홈페이지에서 접수된 입학상담 신청입니다. 최근 신청이 위에 표시됩니다."
      />

      <section
        aria-label="검색 및 필터"
        className="flex flex-col gap-4 rounded-lg border border-line bg-background px-5 py-4"
      >
        <SearchBox
          basePath={BASE_PATH}
          defaultValue={query.q ?? ""}
          hiddenFields={{
            status: query.status,
            program: query.program,
            locale: query.locale,
          }}
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
              label: consultationStatusLabels[status],
              active: query.status === status,
            })),
          ]}
        />

        <FilterGroup
          label="관심 과정"
          options={[
            {
              href: href({ program: undefined, page: undefined }),
              label: "전체",
              active: !query.program,
            },
            ...programTypes.map((program) => ({
              href: href({ program, page: undefined }),
              label: program,
              active: query.program === program,
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
            totalCount === 0 && !query.q && !query.status && !query.program && !query.locale
              ? "접수된 입학상담이 없습니다."
              : "조건에 맞는 입학상담이 없습니다."
          }
        />
      ) : (
        <section className="flex flex-col gap-4">
          {/*
            좁은 화면에서는 표가 가로로 스크롤된다. 페이지 전체가 밀리지 않게 감싼다.
            `relative` 가 필요하다: 표 안의 sr-only 요소는 position:absolute 인데
            위치 기준이 될 조상이 없으면 스크롤 컨테이너를 벗어나 문서 전체를 넓힌다.
            (실제로 모바일에서 페이지가 가로로 밀리는 것을 확인하고 추가했다)
          */}
          <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
            <table className="w-full min-w-[56rem] border-collapse text-sm">
              <caption className="sr-only">입학상담 신청 목록</caption>
              <thead>
                <tr className="border-b border-line bg-surface text-left">
                  <Th>신청일</Th>
                  <Th>이름</Th>
                  <Th>연락처</Th>
                  <Th>이메일</Th>
                  <Th>관심 과정</Th>
                  <Th>언어</Th>
                  <Th>문의내용</Th>
                  <Th>상태</Th>
                  <Th>
                    <span className="sr-only">상세</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0 hover:bg-surface">
                    <Td className="whitespace-nowrap text-muted">
                      <DateTimeText value={row.createdAt} />
                    </Td>
                    <Td className="font-semibold whitespace-nowrap text-navy">
                      {row.name}
                    </Td>
                    <Td className="whitespace-nowrap">{row.phone}</Td>
                    <Td className="whitespace-nowrap">{row.email}</Td>
                    <Td className="whitespace-nowrap">
                      {row.interestedProgram ?? <EmptyValue />}
                    </Td>
                    <Td className="whitespace-nowrap text-muted">
                      {localeLabels[row.locale] ?? row.locale}
                    </Td>
                    <Td className="max-w-[16rem] text-muted">
                      {truncate(row.message, 24) || <EmptyValue />}
                    </Td>
                    <Td>
                      <StatusBadge
                        status={row.status}
                        label={consultationStatusLabels[row.status]}
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
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}
