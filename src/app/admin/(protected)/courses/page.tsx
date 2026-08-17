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
} from "@/components/admin/ui";
import {
  courseCategoryLabels,
  CREDITS_UNSET_LABEL,
  PublishBadge,
  SEMESTER_UNSET_LABEL,
  Td,
  Th,
} from "@/components/admin/cms-ui";
import { getPagination, type RawSearchParams } from "@/lib/admin/inquiry";
import { courseCategories } from "@/lib/cms/validation";
import type { CourseCategory, ProgramType } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "교과목 | Oikos 관리자",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/admin/courses";
/** 교과목은 수십 개 수준이라 한 화면에 넉넉히 보여주는 편이 편집하기 좋다. */
const PAGE_SIZE = 50;

const programTypes: ProgramType[] = ["MBA", "DBA"];

type PageProps = { searchParams: Promise<RawSearchParams> };

function first(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function buildHref(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...overrides })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function AdminCourseListPage({ searchParams }: PageProps) {
  await requireAdmin();

  const raw = await searchParams;

  const programParam = first(raw.program);
  const categoryParam = first(raw.category);
  const semesterParam = first(raw.semester);
  const publishedParam = first(raw.published);
  const pageParam = Number(first(raw.page) ?? "1");

  const programType = programTypes.find((type) => type === programParam);
  const category = courseCategories.find((value) => value === categoryParam);
  // "none" 은 학기 미지정을 뜻한다.
  const semesterFilter =
    semesterParam === "none"
      ? null
      : semesterParam && Number.isInteger(Number(semesterParam))
        ? Number(semesterParam)
        : undefined;

  const where = {
    ...(programType ? { program: { type: programType } } : {}),
    ...(category ? { category: category as CourseCategory } : {}),
    ...(semesterParam !== undefined && semesterFilter !== undefined
      ? { semester: semesterFilter }
      : {}),
    ...(publishedParam === "true"
      ? { isPublished: true }
      : publishedParam === "false"
        ? { isPublished: false }
        : {}),
  };

  const totalCount = await prisma.course.count({ where });
  const pagination = getPagination(
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
    PAGE_SIZE,
    totalCount,
  );

  const rows = await prisma.course.findMany({
    where,
    // 과정 → 학기 → 순서. 학기가 없는 과목은 뒤로 간다.
    orderBy: [
      { program: { type: "asc" } },
      { semester: "asc" },
      { sortOrder: "asc" },
      { titleKo: "asc" },
    ],
    skip: pagination.skip,
    take: pagination.pageSize,
    select: {
      id: true,
      semester: true,
      credits: true,
      category: true,
      titleKo: true,
      titleEn: true,
      sortOrder: true,
      isPublished: true,
      updatedAt: true,
      program: { select: { type: true } },
    },
  });

  const current = {
    program: programParam,
    category: categoryParam,
    semester: semesterParam,
    published: publishedParam,
  };

  // 학기 필터 선택지는 실제 데이터에 있는 학기에서 만든다.
  const semesters = await prisma.course.findMany({
    where: { semester: { not: null } },
    distinct: ["semester"],
    orderBy: { semester: "asc" },
    select: { semester: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="교과목"
        description="MBA · DBA 교육과정에 표시되는 교과목입니다."
      >
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          교과목 추가
        </Link>
      </AdminPageHeader>

      <section
        aria-label="필터"
        className="flex flex-col gap-4 rounded-lg border border-line bg-background px-5 py-4"
      >
        <FilterGroup
          label="과정"
          options={[
            {
              href: buildHref(current, { program: undefined, page: undefined }),
              label: "전체",
              active: !programType,
            },
            ...programTypes.map((type) => ({
              href: buildHref(current, { program: type, page: undefined }),
              label: type,
              active: programType === type,
            })),
          ]}
        />

        <FilterGroup
          label="구분"
          options={[
            {
              href: buildHref(current, { category: undefined, page: undefined }),
              label: "전체",
              active: !category,
            },
            ...courseCategories.map((value) => ({
              href: buildHref(current, { category: value, page: undefined }),
              label: courseCategoryLabels[value],
              active: category === value,
            })),
          ]}
        />

        <FilterGroup
          label="학기"
          options={[
            {
              href: buildHref(current, { semester: undefined, page: undefined }),
              label: "전체",
              active: semesterParam === undefined,
            },
            ...semesters.map((row) => ({
              href: buildHref(current, {
                semester: String(row.semester),
                page: undefined,
              }),
              label: `${row.semester}학기`,
              active: semesterParam === String(row.semester),
            })),
            {
              href: buildHref(current, { semester: "none", page: undefined }),
              label: SEMESTER_UNSET_LABEL,
              active: semesterParam === "none",
            },
          ]}
        />

        <FilterGroup
          label="공개"
          options={[
            {
              href: buildHref(current, { published: undefined, page: undefined }),
              label: "전체",
              active: !publishedParam,
            },
            {
              href: buildHref(current, { published: "true", page: undefined }),
              label: "공개",
              active: publishedParam === "true",
            },
            {
              href: buildHref(current, { published: "false", page: undefined }),
              label: "비공개",
              active: publishedParam === "false",
            },
          ]}
        />
      </section>

      {rows.length === 0 ? (
        <EmptyState
          message={
            totalCount === 0 && Object.values(current).every((value) => !value)
              ? "등록된 교과목이 없습니다."
              : "조건에 맞는 교과목이 없습니다."
          }
        />
      ) : (
        <section className="flex flex-col gap-4">
          <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
              <caption className="sr-only">교과목 목록</caption>
              <thead>
                <tr className="border-b border-line bg-surface text-left">
                  <Th>과정</Th>
                  <Th>학기</Th>
                  <Th>구분</Th>
                  <Th>한국어 과목명</Th>
                  <Th>영어 과목명</Th>
                  <Th>학점</Th>
                  <Th>순서</Th>
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
                    <Td className="font-semibold whitespace-nowrap text-navy">
                      {row.program.type}
                    </Td>
                    <Td className="whitespace-nowrap text-muted">
                      {row.semester === null
                        ? SEMESTER_UNSET_LABEL
                        : `${row.semester}학기`}
                    </Td>
                    <Td className="whitespace-nowrap">
                      {courseCategoryLabels[row.category]}
                    </Td>
                    <Td className="max-w-[18rem]">{row.titleKo}</Td>
                    <Td className="max-w-[18rem] text-muted">
                      {row.titleEn ?? <EmptyValue text="미입력" />}
                    </Td>
                    <Td className="whitespace-nowrap">
                      {row.credits === null ? (
                        <span className="text-muted">{CREDITS_UNSET_LABEL}</span>
                      ) : (
                        `${row.credits}학점`
                      )}
                    </Td>
                    <Td className="text-muted">{row.sortOrder}</Td>
                    <Td>
                      <PublishBadge isPublished={row.isPublished} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted">
                      <DateTimeText value={row.updatedAt} />
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Link
                        href={`/admin/courses/${row.id}/edit`}
                        className="font-semibold text-navy underline-offset-4 hover:underline"
                      >
                        수정
                        <span className="sr-only"> — {row.titleKo}</span>
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
              buildHref(current, {
                page: page > 1 ? String(page) : undefined,
              })
            }
          />
        </section>
      )}
    </div>
  );
}
