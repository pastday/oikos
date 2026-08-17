import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { isProgramType } from "@/lib/admin/inquiry";
import { saveProgram } from "../../cms-actions";

export const metadata: Metadata = {
  title: "과정 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ type: string }> };

/**
 * 과정 수정. URL 은 `/admin/programs/mba` 처럼 과정 종류를 그대로 쓴다.
 * id 보다 읽기 쉽고, 과정이 두 개로 고정되어 있어 문제되지 않는다.
 */
export default async function EditProgramPage({ params }: PageProps) {
  await requireAdmin();

  const { type } = await params;
  const upper = type.toUpperCase();
  if (!isProgramType(upper)) notFound();

  const program = await prisma.program.findUnique({ where: { type: upper } });
  if (!program) notFound();

  const action = saveProgram.bind(null, program.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title={`${program.type} 과정 수정`}
        description="여기서 고친 학기·학점은 과정 상세, 메인 카드, 입학안내, FAQ 문구에 모두 반영됩니다."
      >
        <Link
          href="/admin/programs"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <ProgramForm action={action} values={program} />
    </div>
  );
}
