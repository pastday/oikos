import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, DateTimeText, DetailRow } from "@/components/admin/ui";
import { MediaThumb } from "@/components/admin/MediaThumb";
import { extensionLabel } from "@/lib/media/url";
import { MediaDetailForm } from "@/components/admin/MediaDetailForm";
import { formatBytes, kindFromMimeType } from "@/lib/media/validation";
import { findMediaUsage } from "@/lib/media/usage";
import { deleteMedia, saveMediaAlt } from "../../media-actions";

export const metadata: Metadata = {
  title: "미디어 상세 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function MediaDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) notFound();

  const kind = kindFromMimeType(media.mimeType);
  const usage = await findMediaUsage(media.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <AdminPageHeader title="미디어 상세" description={media.originalName}>
        <Link
          href="/admin/media"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <section className="flex flex-col gap-5 rounded-lg border border-line bg-background p-5 sm:flex-row">
        <MediaThumb
          url={media.path}
          kind={kind}
          alt={media.altKo ?? ""}
          label={extensionLabel(media.storedName)}
        />

        <dl className="min-w-0 flex-1">
          <DetailRow label="원본 파일명">{media.originalName}</DetailRow>
          <DetailRow label="형식">{media.mimeType}</DetailRow>
          <DetailRow label="크기">{formatBytes(media.size)}</DetailRow>
          <DetailRow label="올린 날짜">
            <DateTimeText value={media.createdAt} />
          </DetailRow>
          <DetailRow label="공개 주소">
            {/* 파일시스템 경로가 아니라 브라우저가 쓰는 주소다. */}
            <a
              href={media.path}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-semibold text-navy underline-offset-4 hover:underline"
            >
              {media.path} ↗
            </a>
          </DetailRow>
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-surface px-5 py-4">
        <h2 className="text-sm font-semibold text-navy">사용 중인 곳</h2>

        {usage.length === 0 ? (
          <p className="mt-1.5 text-xs text-muted">
            아직 어디에서도 사용하지 않습니다. 지금은 삭제할 수 있습니다.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {usage.map((item) => (
              <li key={item.href} className="text-xs">
                <Link
                  href={item.href}
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MediaDetailForm
        saveAction={saveMediaAlt.bind(null, media.id)}
        deleteAction={deleteMedia}
        id={media.id}
        originalName={media.originalName}
        isImage={kind === "image"}
        values={{ altKo: media.altKo, altEn: media.altEn }}
      />
    </div>
  );
}
