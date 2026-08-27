import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState, EmptyValue } from "@/components/admin/ui";
import { DeleteForm, PublishBadge, Th, Td } from "@/components/admin/cms-ui";
import { FacultyForm } from "@/components/admin/FacultyForm";
import { toDateInputValue } from "@/lib/admin/format";
import { getMediaChoices } from "@/lib/media/select";
import {
  deleteFaculty,
  deleteFacultyArticle,
  deleteFacultyBook,
  saveFaculty,
} from "../../../cms-actions";

export const metadata: Metadata = {
  title: "교수 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFacultyPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  // 저서·언론보도는 이 화면 아래에 목록으로 함께 그린다. (15단계)
  // 별도 화면으로 빼지 않은 이유는 섹션 항목 관리와 같다 —
  // 관리자가 "이 교수" 를 고칠 때 프로필과 저서를 같이 보게 되기 때문이다.
  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: {
      books: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      articles: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!faculty) notFound();

  const action = saveFaculty.bind(null, faculty.id);
  const mediaOptions = await getMediaChoices("image");
  const facultyHref = `/admin/faculty/${faculty.id}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader title="교수 수정" description={faculty.nameKo}>
        <Link
          href="/admin/faculty"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <FacultyForm
        action={action}
        submitLabel="저장"
        values={faculty}
        mediaOptions={mediaOptions}
      />

      <WorkSection
        title="주요 저서"
        description="공개 교수진 페이지의 [주요 저서] 영역에 표시됩니다."
        addHref={`${facultyHref}/books/new`}
        addLabel="저서 추가"
        emptyMessage="등록된 저서가 없습니다."
        columnLabel="도서명"
      >
        {faculty.books.map((book) => (
          <WorkRow
            key={book.id}
            sortOrder={book.sortOrder}
            title={book.titleKo}
            meta={book.publisherKo}
            publishedAt={book.publishedAt}
            isPublished={book.isPublished}
            editHref={`${facultyHref}/books/${book.id}/edit`}
            deleteAction={deleteFacultyBook}
            id={book.id}
            confirmMessage={`이 저서를 삭제합니다. 되돌릴 수 없습니다.\n\n${book.titleKo}`}
          />
        ))}
      </WorkSection>

      <WorkSection
        title="언론 · 미디어"
        description="공개 교수진 페이지의 [언론 · 미디어] 영역에 표시됩니다. 기사 본문이 아니라 제목 · 게시처 · 짧은 설명 · 원문 링크만 등록합니다."
        addHref={`${facultyHref}/articles/new`}
        addLabel="기사 추가"
        emptyMessage="등록된 기사가 없습니다."
        columnLabel="기사 제목"
      >
        {faculty.articles.map((article) => (
          <WorkRow
            key={article.id}
            sortOrder={article.sortOrder}
            title={article.titleKo}
            meta={article.publisherKo}
            publishedAt={article.publishedAt}
            isPublished={article.isPublished}
            editHref={`${facultyHref}/articles/${article.id}/edit`}
            deleteAction={deleteFacultyArticle}
            id={article.id}
            confirmMessage={`이 기사를 삭제합니다. 되돌릴 수 없습니다.\n\n${article.titleKo}`}
          />
        ))}
      </WorkSection>

      <section className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.03] px-5 py-5">
        <h2 className="text-sm font-semibold text-[#b3261e]">교수 삭제</h2>
        <p className="mt-1.5 mb-4 text-xs leading-relaxed text-muted">
          삭제하면 홈페이지에서도 즉시 사라지며 되돌릴 수 없습니다.
          등록된 저서와 기사도 함께 삭제됩니다.
          잠시 감추려는 것이라면 위의 <strong>홈페이지에 공개</strong> 체크를 해제하세요.
        </p>
        <DeleteForm
          action={deleteFaculty}
          id={faculty.id}
          confirmMessage={`${faculty.nameKo} 교수를 삭제합니다. 되돌릴 수 없습니다. 계속할까요?`}
        />
      </section>
    </div>
  );
}

/**
 * 저서 · 언론보도 목록 한 덩어리.
 *
 * 두 목록이 같은 칸을 쓴다. 제목 · 게시처(출판사) · 날짜 · 공개여부 · 수정/삭제다.
 * 표의 칸 이름만 다르고 나머지는 같아 컴포넌트를 나누지 않았다.
 */
function WorkSection({
  title,
  description,
  addHref,
  addLabel,
  emptyMessage,
  columnLabel,
  children,
}: {
  title: string;
  description: string;
  addHref: string;
  addLabel: string;
  emptyMessage: string;
  columnLabel: string;
  children: ReactNode[];
}) {
  return (
    <section className="mt-4 flex flex-col gap-4 border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>

        <Link
          href={addHref}
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy-soft"
        >
          {addLabel}
        </Link>
      </div>

      {children.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-line bg-surface text-left">
                <Th>순서</Th>
                <Th>{columnLabel}</Th>
                <Th>게시처</Th>
                <Th>날짜</Th>
                <Th>공개</Th>
                <Th>
                  <span className="sr-only">수정 및 삭제</span>
                </Th>
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** 목록 한 줄. 날짜는 `@db.Date` 라 시간대를 적용하지 않고 그대로 보여준다. */
function WorkRow({
  sortOrder,
  title,
  meta,
  publishedAt,
  isPublished,
  editHref,
  deleteAction,
  id,
  confirmMessage,
}: {
  sortOrder: number;
  title: string;
  meta: string | null;
  publishedAt: Date | null;
  isPublished: boolean;
  editHref: string;
  deleteAction: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
}) {
  const date = toDateInputValue(publishedAt);

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface">
      <Td className="text-muted">{sortOrder}</Td>
      <Td className="max-w-md font-semibold text-navy">{title}</Td>
      <Td className="text-foreground/80">{meta ?? <EmptyValue />}</Td>
      <Td className="whitespace-nowrap text-muted">
        {date ? <time dateTime={date}>{date}</time> : <EmptyValue />}
      </Td>
      <Td>
        <PublishBadge isPublished={isPublished} />
      </Td>
      <Td className="whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Link
            href={editHref}
            className="font-semibold text-navy underline-offset-4 hover:underline"
          >
            수정
            <span className="sr-only"> — {title}</span>
          </Link>
          <DeleteForm
            action={deleteAction}
            id={id}
            confirmMessage={confirmMessage}
          />
        </div>
      </Td>
    </tr>
  );
}
