import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { AdminPageHeader } from "@/components/admin/ui";
import { NewsForm } from "@/components/admin/NewsForm";
import { getAllMediaChoices, getMediaChoices } from "@/lib/media/select";
import { saveNews } from "../../news-actions";

export const metadata: Metadata = {
  title: "학교소식 등록 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/** 게시일 기본값은 오늘. `<input type="date">` 형식(YYYY-MM-DD)으로 넘긴다. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewNewsPage() {
  await requireAdmin();

  const [imageOptions, attachmentOptions] = await Promise.all([
    getMediaChoices("image"),
    getAllMediaChoices(),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="학교소식 등록"
        description="한국어 제목과 본문은 필수입니다. 영문을 비워 두면 영문 페이지에도 한국어가 표시됩니다."
      >
        <Link
          href="/admin/news"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <NewsForm
        action={saveNews.bind(null, null)}
        submitLabel="등록"
        imageOptions={imageOptions}
        attachmentOptions={attachmentOptions}
        values={{
          slug: null,
          titleKo: "",
          titleEn: null,
          summaryKo: null,
          summaryEn: null,
          contentKo: "",
          contentEn: null,
          category: "NOTICE",
          publishedAt: today(),
          isPublished: true,
          coverMediaId: null,
          attachmentMediaIds: [],
        }}
      />
    </div>
  );
}
