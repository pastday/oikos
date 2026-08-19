import Image from "next/image";
import type { MediaView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

/**
 * B안에서 CMS 이미지·문서를 그리는 조각들.
 *
 * **Media 데이터와 규칙은 A안과 똑같다.** 같은 `Media` 테이블, 같은 URL, 같은 대체 텍스트를
 * 쓴다. (13단계 지시 28항) 달라지는 것은 테두리·비율·버튼 모양뿐이다.
 *
 * A안과 같은 원칙을 그대로 지킨다.
 *  - 파일이 지정되지 않으면 **아무것도 그리지 않는다.** 빈 상자나 404 링크를 만들지 않는다.
 *  - 업로드 이미지는 가로·세로를 모르므로 `fill` 로 그리고 바깥 상자가 비율을 정한다.
 *  - 로고는 잘리면 알아볼 수 없으므로 `object-contain` 으로 그린다.
 */

/** 섹션 대표 이미지. B안은 조금 더 넓은 3:2 비율을 쓴다. */
export function SectionImageB({
  media,
  className,
}: {
  media: MediaView | null;
  className?: string;
}) {
  if (!media) return null;

  return (
    <div
      className={cn(
        "relative aspect-[3/2] w-full overflow-hidden border border-rule bg-paper-2",
        className,
      )}
    >
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes="(min-width: 1024px) 44rem, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/** 항목(기관 로고 등) 이미지. 잘리지 않게 `contain` 으로 그린다. */
export function ItemImageB({
  media,
  size = 44,
}: {
  media: MediaView | null;
  size?: number;
}) {
  if (!media) return null;

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </span>
  );
}

// ---------------------------------------------------------------------------

/** 용량 표기. 1KB 미만도 최소 1 KB 로 적는다. (A안과 같은 이유) */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 문서(PDF) 링크. 새 탭으로 열고, 형식과 용량을 함께 적는다. */
export function DocumentLinkB({
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
      className="inline-flex items-center gap-3 border border-ink px-6 py-4 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
    >
      <span
        aria-hidden="true"
        className="border border-current px-1.5 py-0.5 text-[0.5625rem] font-bold"
      >
        PDF
      </span>
      {label}
      <span className="text-[0.6875rem] font-normal tracking-normal normal-case opacity-70">
        ({formatSize(media.size)})
      </span>
      <span className="sr-only">{newWindowLabel}</span>
    </a>
  );
}
