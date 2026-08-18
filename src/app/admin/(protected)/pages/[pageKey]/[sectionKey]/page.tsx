import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState, EmptyValue } from "@/components/admin/ui";
import { DeleteForm, PublishBadge, Th, Td } from "@/components/admin/cms-ui";
import {
  PageSectionForm,
  type PageSectionFormValues,
} from "@/components/admin/PageSectionForm";
import { findSection } from "@/lib/cms/page-catalog";
import { deletePageSectionItem, savePageSection } from "../../../cms-actions";

export const metadata: Metadata = {
  title: "섹션 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ pageKey: string; sectionKey: string }> };

/**
 * 섹션 수정.
 *
 * 위쪽은 텍스트 슬롯 편집, 아래쪽은 반복 항목 목록이다.
 * 두 화면으로 나누지 않은 이유는 관리자가 "이 섹션"을 고칠 때
 * 문구와 카드를 같이 보게 되기 때문이다.
 *
 * 아직 한 번도 저장하지 않은 섹션이면 DB 행이 없다. 그래도 빈 폼을 보여 준다.
 * 저장할 때 `upsert` 로 만들어진다.
 */
export default async function AdminSectionEditPage({ params }: PageProps) {
  await requireAdmin();

  const { pageKey, sectionKey } = await params;

  const found = findSection(pageKey, sectionKey);
  if (!found) notFound();

  const { page, section } = found;

  const row = await prisma.pageSection.findUnique({
    where: { pageKey_sectionKey: { pageKey, sectionKey } },
    include: {
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  const values: PageSectionFormValues = {
    titleKo: row?.titleKo ?? null,
    titleEn: row?.titleEn ?? null,
    subtitleKo: row?.subtitleKo ?? null,
    subtitleEn: row?.subtitleEn ?? null,
    bodyKo: row?.bodyKo ?? null,
    bodyEn: row?.bodyEn ?? null,
    highlightKo: row?.highlightKo ?? null,
    highlightEn: row?.highlightEn ?? null,
    noteKo: row?.noteKo ?? null,
    noteEn: row?.noteEn ?? null,
    // 새 섹션은 기본으로 표시한다. 저장하자마자 화면에서 사라지면 당황스럽다.
    isPublished: row?.isPublished ?? true,
  };

  const action = savePageSection.bind(null, pageKey, sectionKey);
  const listHref = `/admin/pages/${pageKey}`;
  const sectionHref = `${listHref}/${sectionKey}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title={`${page.label} — ${section.label}`}
        description={`공개 페이지의 ${section.description}에 표시됩니다.`}
      >
        <Link
          href={listHref}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      {section.notice && (
        <p className="rounded-lg border border-dashed border-line bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
          {section.notice}
        </p>
      )}

      <PageSectionForm
        action={action}
        section={section}
        values={values}
        cancelHref={listHref}
      />

      {section.items && (
        <section className="mt-4 flex flex-col gap-4 border-t border-line pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-navy">
                {section.items.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {section.items.description}
              </p>
            </div>

            {row ? (
              <Link
                href={`${sectionHref}/items/new`}
                className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
              >
                {section.items.addLabel}
              </Link>
            ) : (
              <span className="text-xs text-muted">
                섹션을 먼저 저장하면 항목을 추가할 수 있습니다.
              </span>
            )}
          </div>

          {!row || row.items.length === 0 ? (
            <EmptyState message="등록된 항목이 없습니다." />
          ) : (
            <div className="relative overflow-x-auto rounded-lg border border-line bg-background">
              <table className="w-full min-w-[46rem] border-collapse text-sm">
                <caption className="sr-only">{section.items.title}</caption>
                <thead>
                  <tr className="border-b border-line bg-surface text-left">
                    <Th>순서</Th>
                    {section.items.label && <Th>{section.items.label.label}</Th>}
                    {section.items.value && <Th>{section.items.value.label}</Th>}
                    {section.items.variants && <Th>형태</Th>}
                    <Th>표시</Th>
                    <Th>
                      <span className="sr-only">수정 및 삭제</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {row.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-line last:border-b-0 hover:bg-surface"
                    >
                      <Td className="text-muted">{item.sortOrder}</Td>
                      {section.items?.label && (
                        <Td className="font-semibold text-navy">
                          {item.labelKo ?? <EmptyValue />}
                        </Td>
                      )}
                      {section.items?.value && (
                        <Td className="max-w-md text-foreground/80">
                          {item.valueKo ?? <EmptyValue />}
                        </Td>
                      )}
                      {section.items?.variants && (
                        <Td className="whitespace-nowrap text-muted">
                          {section.items.variants.find(
                            (variant) => variant.value === item.variant,
                          )?.label ?? <EmptyValue />}
                        </Td>
                      )}
                      <Td>
                        <PublishBadge isPublished={item.isPublished} />
                      </Td>
                      <Td className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`${sectionHref}/items/${item.id}/edit`}
                            className="font-semibold text-navy underline-offset-4 hover:underline"
                          >
                            수정
                          </Link>
                          <DeleteForm
                            action={deletePageSectionItem}
                            id={item.id}
                            confirmMessage={`이 항목을 삭제합니다. 되돌릴 수 없습니다.\n\n${
                              item.labelKo ?? item.valueKo ?? ""
                            }`}
                          />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
