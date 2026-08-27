import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/cms-ui";
import { FacultyBookForm } from "@/components/admin/FacultyWorkForm";
import { toDateInputValue } from "@/lib/admin/format";
import { getMediaChoices } from "@/lib/media/select";
import { deleteFacultyBook, saveFacultyBook } from "../../../../../cms-actions";

export const metadata: Metadata = {
  title: "저서 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string; bookId: string }> };

/**
 * 주요 저서 수정.
 *
 * **교수 id 와 저서 id 를 함께 걸어 조회한다.** 주소를 바꿔 다른 교수의 저서를
 * 이 교수 밑에서 여는 것을 막는다. 저장 액션도 같은 조건을 다시 건다.
 */
export default async function EditFacultyBookPage({ params }: PageProps) {
  await requireAdmin();

  const { id, bookId } = await params;

  const book = await prisma.facultyBook.findFirst({
    where: { id: bookId, facultyId: id },
    include: { faculty: { select: { id: true, nameKo: true } } },
  });
  if (!book) notFound();

  const action = saveFacultyBook.bind(null, book.facultyId, book.id);
  const mediaOptions = await getMediaChoices("image");
  const backHref = `/admin/faculty/${book.facultyId}/edit`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="저서 수정"
        description={`${book.faculty.nameKo} 교수 — ${book.titleKo}`}
      >
        <Link
          href={backHref}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          교수 정보로
        </Link>
      </AdminPageHeader>

      <FacultyBookForm
        action={action}
        submitLabel="저장"
        cancelHref={backHref}
        mediaOptions={mediaOptions}
        values={{ ...book, publishedAt: toDateInputValue(book.publishedAt) }}
      />

      <section className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.03] px-5 py-5">
        <h2 className="text-sm font-semibold text-[#b3261e]">저서 삭제</h2>
        <p className="mt-1.5 mb-4 text-xs leading-relaxed text-muted">
          삭제하면 홈페이지에서도 즉시 사라지며 되돌릴 수 없습니다.
          잠시 감추려는 것이라면 위의 <strong>홈페이지에 공개</strong> 체크를 해제하세요.
        </p>
        <DeleteForm
          action={deleteFacultyBook}
          id={book.id}
          confirmMessage={`이 저서를 삭제합니다. 되돌릴 수 없습니다.\n\n${book.titleKo}`}
        />
      </section>
    </div>
  );
}
