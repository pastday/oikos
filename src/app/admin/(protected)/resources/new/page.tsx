import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { AdminPageHeader } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getAllMediaChoices } from "@/lib/media/select";
import { saveResource } from "../../resource-actions";

export const metadata: Metadata = {
  title: "자료 등록 | Oikos 관리자",
  robots: { index: false, follow: false },
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewResourcePage() {
  await requireAdmin();

  const attachmentOptions = await getAllMediaChoices();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="자료 등록"
        description="한국어 제목은 필수입니다. 첨부파일은 [미디어] 에 먼저 올린 뒤 선택합니다."
      >
        <Link
          href="/admin/resources"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <ResourceForm
        action={saveResource.bind(null, null)}
        submitLabel="등록"
        attachmentOptions={attachmentOptions}
        values={{
          slug: null,
          category: "ADMISSION",
          titleKo: "",
          titleEn: null,
          summaryKo: null,
          summaryEn: null,
          contentKo: null,
          contentEn: null,
          publishedAt: today(),
          isPublished: true,
          attachmentMediaIds: [],
        }}
      />
    </div>
  );
}
