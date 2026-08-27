import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FacultyArticleForm } from "@/components/admin/FacultyWorkForm";
import { getMediaChoices } from "@/lib/media/select";
import { saveFacultyArticle } from "../../../../cms-actions";

export const metadata: Metadata = {
  title: "언론 · 미디어 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function NewFacultyArticlePage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { id },
    select: { id: true, nameKo: true },
  });
  if (!faculty) notFound();

  const action = saveFacultyArticle.bind(null, faculty.id, null);
  const mediaOptions = await getMediaChoices("image");
  const backHref = `/admin/faculty/${faculty.id}/edit`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="언론 · 미디어 추가"
        description={`${faculty.nameKo} 교수`}
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
        submitLabel="추가"
        cancelHref={backHref}
        mediaOptions={mediaOptions}
        values={{
          titleKo: "",
          titleEn: null,
          summaryKo: null,
          summaryEn: null,
          publisherKo: null,
          publisherEn: null,
          publishedAt: "",
          externalUrl: null,
          imageMediaId: null,
          sortOrder: 0,
          isPublished: true,
        }}
      />
    </div>
  );
}
