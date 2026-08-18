import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { FaqForm } from "@/components/admin/FaqForm";
import { saveFaq } from "../../cms-actions";

export const metadata: Metadata = {
  title: "FAQ 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

export default async function NewFaqPage() {
  await requireAdmin();

  // 새 질문은 목록 맨 뒤에 오도록 마지막 순서 + 1 을 기본값으로 준다.
  const last = await prisma.fAQ.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="FAQ 추가"
        description="원본 자료로 확인할 수 있는 내용만 등록합니다. 확인되지 않은 답변을 만들지 않습니다."
      >
        <Link
          href="/admin/faq"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <FaqForm
        action={saveFaq.bind(null, null)}
        values={{
          questionKo: "",
          questionEn: null,
          answerKo: "",
          answerEn: null,
          sortOrder: (last?.sortOrder ?? -1) + 1,
          isPublished: true,
        }}
        submitLabel="추가"
      />
    </div>
  );
}
