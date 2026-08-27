import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FacultyBookForm } from "@/components/admin/FacultyWorkForm";
import { getMediaChoices } from "@/lib/media/select";
import { saveFacultyBook } from "../../../../cms-actions";

export const metadata: Metadata = {
  title: "저서 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * 주요 저서 추가.
 *
 * 새 저서는 **표시순서 0, 공개 상태**로 시작한다. 추가하자마자 화면에서 사라지면
 * 관리자가 무엇이 잘못됐는지 알기 어렵다. (섹션 항목 추가 화면과 같은 판단)
 */
export default async function NewFacultyBookPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { id },
    select: { id: true, nameKo: true },
  });
  if (!faculty) notFound();

  const action = saveFacultyBook.bind(null, faculty.id, null);
  const mediaOptions = await getMediaChoices("image");
  const backHref = `/admin/faculty/${faculty.id}/edit`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader title="저서 추가" description={`${faculty.nameKo} 교수`}>
        <Link
          href={backHref}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          교수 정보로
        </Link>
      </AdminPageHeader>

      <FacultyBookForm
        action={action}
        submitLabel="추가"
        cancelHref={backHref}
        mediaOptions={mediaOptions}
        values={{
          titleKo: "",
          titleEn: null,
          subtitleKo: null,
          subtitleEn: null,
          authorKo: null,
          authorEn: null,
          publisherKo: null,
          publisherEn: null,
          publishedAt: "",
          isbn: null,
          descriptionKo: null,
          descriptionEn: null,
          externalUrl: null,
          coverMediaId: null,
          sortOrder: 0,
          isPublished: true,
        }}
      />
    </div>
  );
}
