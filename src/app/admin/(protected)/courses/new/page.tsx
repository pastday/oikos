import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { CourseForm } from "@/components/admin/CourseForm";
import { saveCourse } from "../../cms-actions";

export const metadata: Metadata = {
  title: "교과목 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

export default async function NewCoursePage() {
  await requireAdmin();

  const programs = await prisma.program.findMany({
    orderBy: { type: "asc" },
    select: { id: true, type: true, nameKo: true },
  });

  if (programs.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <AdminPageHeader title="교과목 추가" />
        <div className="mt-6">
          <EmptyState message="과정이 없어 교과목을 만들 수 없습니다. 먼저 과정을 등록해 주세요." />
        </div>
      </div>
    );
  }

  const action = saveCourse.bind(null, null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="교과목 추가"
        description="원본 자료에 학기·학점·영문명이 없으면 비워 두세요. 임의로 채우지 않습니다."
      >
        <Link
          href="/admin/courses"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <CourseForm
        action={action}
        submitLabel="등록"
        programs={programs.map((p) => ({ id: p.id, label: `${p.type} — ${p.nameKo}` }))}
        values={{
          programId: programs[0].id,
          semester: null,
          credits: null,
          category: "MAJOR",
          titleKo: "",
          titleEn: null,
          descriptionKo: null,
          descriptionEn: null,
          sortOrder: 0,
          isPublished: true,
        }}
      />
    </div>
  );
}
