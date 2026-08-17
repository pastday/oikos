import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/cms-ui";
import { FacultyForm } from "@/components/admin/FacultyForm";
import { deleteFaculty, saveFaculty } from "../../../cms-actions";

export const metadata: Metadata = {
  title: "교수 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFacultyPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({ where: { id } });
  if (!faculty) notFound();

  const action = saveFaculty.bind(null, faculty.id);

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

      <FacultyForm action={action} submitLabel="저장" values={faculty} />

      <section className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.03] px-5 py-5">
        <h2 className="text-sm font-semibold text-[#b3261e]">교수 삭제</h2>
        <p className="mt-1.5 mb-4 text-xs leading-relaxed text-muted">
          삭제하면 홈페이지에서도 즉시 사라지며 되돌릴 수 없습니다.
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
