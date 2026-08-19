import type { MediaView } from "@/lib/cms/types";

/**
 * 문서(PDF) 링크.
 *
 * 지정되지 않았으면 **아무것도 그리지 않는다.** 404 가 될 링크를 미리 만들지 않는다.
 * 새 탭으로 열고, 형식과 용량을 함께 적어 눌렀을 때 무엇이 열릴지 미리 알린다.
 * (A안과 같은 규칙이며 모양만 B안 어휘를 따른다)
 */
export function BDocumentLink({
  media,
  label,
  newWindowLabel,
}: {
  media: MediaView | null;
  label: string;
  newWindowLabel: string;
}) {
  if (!media) return null;

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-baseline gap-4 border-b border-ink/30 pb-3 transition-colors hover:border-ink"
    >
      <span
        aria-hidden="true"
        className="text-[0.625rem] font-bold tracking-[0.2em] text-bronze"
      >
        PDF
      </span>
      <span className="font-serif text-xl font-bold text-ink sm:text-2xl">
        {label}
      </span>
      <span className="text-xs text-quiet">({formatSize(media.size)})</span>
      <span
        aria-hidden="true"
        className="text-ink transition-transform group-hover:translate-x-1"
      >
        ↗
      </span>
      <span className="sr-only">{newWindowLabel}</span>
    </a>
  );
}

/** 1KB 미만도 최소 1 KB 로 적는다. "0 KB" 는 파일이 비어 있는 것처럼 보인다. */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
