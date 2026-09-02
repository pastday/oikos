import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { AdminPageHeader } from "@/components/admin/ui";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { uploadMedia } from "../../media-actions";

export const metadata: Metadata = {
  title: "파일 올리기 | Oikos 관리자",
  robots: { index: false, follow: false },
};

export default async function NewMediaPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AdminPageHeader
        title="파일 올리기"
        description="올린 파일은 미디어 목록에 쌓이고, 교수진 사진·자료실 첨부 등에서 선택해 사용합니다."
      >
        <Link
          href="/admin/media"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <MediaUploadForm action={uploadMedia} />
    </div>
  );
}
