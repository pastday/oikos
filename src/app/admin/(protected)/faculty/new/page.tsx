import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { AdminPageHeader } from "@/components/admin/ui";
import { FacultyForm } from "@/components/admin/FacultyForm";
import { getMediaChoices } from "@/lib/media/select";
import { saveFaculty } from "../../cms-actions";

export const metadata: Metadata = {
  title: "교수 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

export default async function NewFacultyPage() {
  await requireAdmin();

  // 신규 등록이므로 id 가 없다. 저장에 성공하면 액션이 목록으로 보낸다.
  const action = saveFaculty.bind(null, null);
  const mediaOptions = await getMediaChoices("image");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="교수 추가"
        description="한국어 항목만 입력해도 등록됩니다. 영어를 비워 두면 영문 페이지에서 한국어 표기가 그대로 표시됩니다."
      >
        <Link
          href="/admin/faculty"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <FacultyForm
        action={action}
        submitLabel="등록"
        mediaOptions={mediaOptions}
        values={{
          type: "PROFESSOR",
          nameKo: "",
          nameEn: null,
          titleKo: null,
          titleEn: null,
          majorKo: null,
          majorEn: null,
          careerKo: null,
          careerEn: null,
          lectureFieldsKo: null,
          lectureFieldsEn: null,
          photoMediaId: null,
          sortOrder: 0,
          isPublished: true,
        }}
      />
    </div>
  );
}
