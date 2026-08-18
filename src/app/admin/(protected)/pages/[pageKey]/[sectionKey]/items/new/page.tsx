import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { findSection } from "@/lib/cms/page-catalog";
import { getMediaChoices } from "@/lib/media/select";
import { savePageSectionItem } from "../../../../../cms-actions";

export const metadata: Metadata = {
  title: "항목 추가 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ pageKey: string; sectionKey: string }> };

export default async function NewSectionItemPage({ params }: PageProps) {
  await requireAdmin();

  const { pageKey, sectionKey } = await params;

  const found = findSection(pageKey, sectionKey);
  if (!found?.section.items) notFound();

  // 항목은 섹션 행이 있어야 붙일 수 있다. 아직 저장하지 않은 섹션이면 편집 화면으로 되돌린다.
  const section = await prisma.pageSection.findUnique({
    where: { pageKey_sectionKey: { pageKey, sectionKey } },
    select: { id: true },
  });

  if (!section) notFound();

  const sectionHref = `/admin/pages/${pageKey}/${sectionKey}`;
  const action = savePageSectionItem.bind(null, section.id, null);

  // 새 항목은 목록 맨 뒤에 오도록 마지막 순서 + 1 을 기본값으로 준다.
  const imageChoices = found.section.items.image
    ? await getMediaChoices("image")
    : [];

  const last = await prisma.pageSectionItem.findFirst({
    where: { sectionId: section.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title={`${found.section.label} — ${found.section.items.title} 추가`}
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
          labelKo: null,
          labelEn: null,
          valueKo: null,
          valueEn: null,
          variant: null,
          mediaId: null,
          sortOrder: (last?.sortOrder ?? -1) + 1,
          isPublished: true,
        }}
        submitLabel="추가"
        cancelHref={sectionHref}
        imageChoices={imageChoices}
      />
    </div>
  );
}
