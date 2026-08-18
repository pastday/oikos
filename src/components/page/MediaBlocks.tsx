import Image from "next/image";
import type { MediaView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

/**
 * 공개 페이지에서 CMS 이미지·문서를 그리는 조각들.
 *
 * ## 없으면 아무것도 그리지 않는다
 *
 * 모든 컴포넌트가 `media` 가 없으면 `null` 을 돌려준다.
 * 그래서 관리자가 파일을 지정하지 않아도 페이지는 기존 모습 그대로다.
 * 404 가 될 링크나 빈 상자를 미리 그려 두지 않는다.
 *
 * ## 왜 크기를 모르는데 next/image 를 쓰는가
 *
 * 업로드 이미지는 가로·세로를 알 수 없다. (Media 에 저장하지 않는다)
 * 그래서 `fill` 로 그리고 **바깥 상자가 비율을 정한다.**
 * 이렇게 하면 어떤 크기의 파일을 올려도 레이아웃이 흔들리지 않는다.
 * `object-cover` 는 잘라서 채우고, `object-contain` 은 로고처럼 잘리면 안 되는 것에 쓴다.
 */

/** 섹션 대표 이미지. 16:10 상자에 맞춰 채운다. */
export function SectionImage({
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
        "relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-surface",
        className,
      )}
    >
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes="(min-width: 1024px) 40rem, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/**
 * 항목(카드) 이미지. 로고가 들어올 수 있어 **잘리지 않게** `contain` 으로 그린다.
 * 기관 로고는 여백과 비율이 제각각이라 잘라 내면 알아볼 수 없게 된다.
 */
export function ItemImage({
  media,
  size = 40,
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

/**
 * 용량 표기.
 *
 * 1KB 가 안 되는 파일도 **최소 1 KB 로 적는다.** 반올림하면 "0 KB" 가 되는데,
 * 그 표기는 파일이 비어 있거나 무언가 잘못된 것처럼 보인다.
 * 여기서 정확한 바이트 수가 필요한 것이 아니라 "얼마나 큰지" 만 알려 주면 된다.
 */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 문서(PDF) 내려받기 링크.
 *
 * 새 탭으로 연다. 지원 절차를 읽던 중에 PDF 로 페이지가 통째로 바뀌면
 * 뒤로 가기로 돌아와야 해서 흐름이 끊긴다.
 * 링크 문구에 형식과 용량을 함께 적는다. 눌렀을 때 무엇이 열릴지 미리 알 수 있어야 한다.
 */
export function DocumentLink({
  media,
  label,
  newWindowLabel,
}: {
  media: MediaView | null;
  label: string;
  /** 새 탭에서 열린다는 것을 화면 읽기 프로그램에 알리는 문구 */
  newWindowLabel: string;
}) {
  if (!media) return null;

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      <span
        aria-hidden="true"
        className="rounded border border-current px-1.5 py-0.5 text-[0.625rem] font-bold"
      >
        PDF
      </span>
      {label}
      <span className="text-xs font-normal opacity-75">
        ({formatSize(media.size)})
      </span>
      <span className="sr-only">{newWindowLabel}</span>
    </a>
  );
}
