import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/cms-ui";
import { FacultyArticleForm } from "@/components/admin/FacultyWorkForm";
import { toDateInputValue } from "@/lib/admin/format";
import { getMediaChoices } from "@/lib/media/select";
import {
  deleteFacultyArticle,
  saveFacultyArticle,
} from "../../../../../cms-actions";

export const metadata: Metadata = {
  title: "언론 · 미디어 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string; articleId: string }> };

/** 저서 수정 화면과 같은 이유로 교수 id 와 함께 조회한다. */
export default async function EditFacultyArticlePage({ params }: PageProps) {
  await requireAdmin();

  const { id, articleId } = await params;

  const article = await prisma.facultyArticle.findFirst({
    where: { id: articleId, facultyId: id },
    include: { faculty: { select: { id: true, nameKo: true } } },
  });
  if (!article) notFound();

  const action = saveFacultyArticle.bind(null, article.facultyId, article.id);
  const mediaOptions = await getMediaChoices("image");
  const backHref = `/admin/faculty/${article.facultyId}/edit`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="언론 · 미디어 수정"
        description={`${article.faculty.nameKo} 교수 — ${article.titleKo}`}
      >
        <Link
          href={backHref}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          교수 정보로
        </Link>
      </AdminPageHeader>

      <FacultyArticleForm
        action={action}
        submitLabel="저장"
        cancelHref={backHref}
        mediaOptions={mediaOptions}
        values={{
          ...article,
          publishedAt: toDateInputValue(article.publishedAt),
        }}
      />

      <section className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.03] px-5 py-5">
        <h2 className="text-sm font-semibold text-[#b3261e]">기사 삭제</h2>
        <p className="mt-1.5 mb-4 text-xs leading-relaxed text-muted">
          삭제하면 홈페이지에서도 즉시 사라지며 되돌릴 수 없습니다.
          잠시 감추려는 것이라면 위의 <strong>홈페이지에 공개</strong> 체크를 해제하세요.
        </p>
        <DeleteForm
          action={deleteFacultyArticle}
          id={article.id}
          confirmMessage={`이 기사를 삭제합니다. 되돌릴 수 없습니다.\n\n${article.titleKo}`}
        />
      </section>
    </div>
  );
}
