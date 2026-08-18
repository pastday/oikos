import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { findSection } from "@/lib/cms/page-catalog";
import { savePageSectionItem } from "../../../../../../cms-actions";

export const metadata: Metadata = {
  title: "항목 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ pageKey: string; sectionKey: string; itemId: string }>;
};

export default async function EditSectionItemPage({ params }: PageProps) {
  await requireAdmin();

  const { pageKey, sectionKey, itemId } = await params;

  const found = findSection(pageKey, sectionKey);
  if (!found?.section.items) notFound();

  const item = await prisma.pageSectionItem.findUnique({
    where: { id: itemId },
    include: { section: { select: { id: true, pageKey: true, sectionKey: true } } },
  });

  // URL 의 페이지·섹션과 항목이 실제로 속한 섹션이 다르면 없는 것으로 본다.
  // 다른 섹션의 항목을 이 화면에서 고치는 경로를 열어 두지 않는다.
  if (
    !item ||
    item.section.pageKey !== pageKey ||
    item.section.sectionKey !== sectionKey
  ) {
    notFound();
  }

  const sectionHref = `/admin/pages/${pageKey}/${sectionKey}`;
  const action = savePageSectionItem.bind(null, item.section.id, item.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title={`${found.section.label} — 항목 수정`}
        description={found.section.items.description}
      >
        <Link
          href={sectionHref}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          섹션으로
        </Link>
      </AdminPageHeader>

      <PageSectionItemForm
        action={action}
        spec={found.section.items}
        values={{
          labelKo: item.labelKo,
          labelEn: item.labelEn,
          valueKo: item.valueKo,
          valueEn: item.valueEn,
          variant: item.variant,
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
        }}
        submitLabel="저장"
        cancelHref={sectionHref}
      />
    </div>
  );
}
