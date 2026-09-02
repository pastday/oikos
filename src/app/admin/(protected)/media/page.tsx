import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DateTimeText,
  EmptyState,
  EmptyValue,
} from "@/components/admin/ui";
import { MediaThumb } from "@/components/admin/MediaThumb";
import { formatBytes, kindFromMimeType } from "@/lib/media/validation";
import { extensionLabel } from "@/lib/media/url";

export const metadata: Metadata = {
  title: "미디어 | Oikos 관리자",
  robots: { index: false, follow: false },
};

/**
 * 미디어 목록.
 *
 * 표가 아니라 **카드 목록**으로 그린다. 미리보기·파일명·대체텍스트를 한 줄에 넣으면
 * 표가 넓어져 모바일에서 가로로 밀린다. 카드는 좁은 화면에서 자연스럽게 쌓인다.
 * (11단계 지시 30항)
 */
export default async function AdminMediaListPage() {
  await requireAdmin();

  const rows = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="미디어"
        description="교수 사진·이미지·PDF·문서(HWP·DOCX 등)를 올리고 관리합니다. 올린 파일은 CMS 에서 선택해 사용합니다."
      >
        <Link
          href="/admin/media/new"
          className="rounded-md bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          파일 올리기
        </Link>
      </AdminPageHeader>

      {rows.length === 0 ? (
        <EmptyState message="올린 파일이 없습니다." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const kind = kindFromMimeType(row.mimeType);
            const ext = extensionLabel(row.storedName);

            return (
              <li
                key={row.id}
                className="flex gap-4 rounded-lg border border-line bg-background p-4"
              >
                <MediaThumb
                  url={row.path}
                  kind={kind}
                  alt={row.altKo ?? ""}
                  label={ext}
                />

                <div className="min-w-0 flex-1">
                  {/* 원본 파일명은 사용자가 정한 값이다. React 가 escape 하므로
                      태그가 들어 있어도 문자로만 표시된다. */}
                  <p className="truncate text-sm font-semibold text-navy">
                    {row.originalName}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {ext}
                    {" · "}
                    {formatBytes(row.size)}
                    {" · "}
                    <DateTimeText value={row.createdAt} />
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs text-foreground/70">
                    {row.altKo ?? <EmptyValue text="대체 텍스트 없음" />}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/media/${row.id}`}
                      className="text-xs font-semibold text-navy underline-offset-4 hover:underline"
                    >
                      상세
                      <span className="sr-only"> — {row.originalName}</span>
                    </Link>
                    <a
                      href={row.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-muted underline-offset-4 hover:text-navy hover:underline"
                    >
                      열기 ↗
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
