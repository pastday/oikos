import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/cms-ui";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { toDateInputValue } from "@/lib/admin/format";
import { getAllMediaChoices } from "@/lib/media/select";
import { deleteResource, saveResource } from "../../../resource-actions";

export const metadata: Metadata = {
  title: "자료 수정 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditResourcePage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const post = await prisma.resourcePost.findUnique({
    where: { id },
    include: {
      attachments: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { mediaId: true },
      },
    },
  });
  if (!post) notFound();

  const attachmentOptions = await getAllMediaChoices();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <AdminPageHeader title="자료 수정" description={post.titleKo}>
        <Link
          href="/admin/resources"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <ResourceForm
        action={saveResource.bind(null, post.id)}
        submitLabel="저장"
        attachmentOptions={attachmentOptions}
        values={{
          slug: post.slug,
          category: post.category,
          titleKo: post.titleKo,
          titleEn: post.titleEn,
          summaryKo: post.summaryKo,
          summaryEn: post.summaryEn,
          contentKo: post.contentKo,
          contentEn: post.contentEn,
          publishedAt: toDateInputValue(post.publishedAt),
          isPublished: post.isPublished,
          attachmentMediaIds: post.attachments.map(
            (attachment) => attachment.mediaId,
          ),
        }}
      />

      <section className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.03] px-5 py-5">
        <h2 className="text-sm font-semibold text-[#b3261e]">자료 삭제</h2>
        <p className="mt-1.5 mb-4 text-xs leading-relaxed text-muted">
          삭제하면 홈페이지에서도 즉시 사라지며 되돌릴 수 없습니다. 잠시 감추려는
          것이라면 위의 <strong>홈페이지에 공개</strong> 체크를 해제하세요. 첨부한
          파일 자체는 [미디어] 에 그대로 남습니다.
        </p>
        <DeleteForm
          action={deleteResource}
          id={post.id}
          confirmMessage={`이 자료를 삭제하시겠습니까?\n\n${post.titleKo}`}
        />
      </section>
    </div>
  );
}
