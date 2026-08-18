import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FaqForm } from "@/components/admin/FaqForm";
import { saveFaq } from "../../../cms-actions";

export const metadata: Metadata = {
  title: "FAQ 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFaqPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const faq = await prisma.fAQ.findUnique({ where: { id } });
  if (!faq) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="FAQ 수정"
        description="홈페이지 FAQ 페이지에 바로 반영됩니다."
      >
        <Link
          href="/admin/faq"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <FaqForm
        action={saveFaq.bind(null, faq.id)}
        values={{
          questionKo: faq.questionKo,
          questionEn: faq.questionEn,
          answerKo: faq.answerKo,
          answerEn: faq.answerEn,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished,
        }}
        submitLabel="저장"
      />
    </div>
  );
}
