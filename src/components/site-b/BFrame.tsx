import Image from "next/image";
import type { MediaView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

/**
 * 이미지가 들어갈 자리.
 *
 * ## 왜 별도 컴포넌트인가
 *
 * A안에는 이미지 자리가 사실상 없다. 사진이 지정된 경우에만 상자를 하나 그린다.
 * B안은 반대로 **비주얼 영역을 먼저 설계에 넣어 두고**, 사진이 없으면 그 자리를
 * 디자인된 면으로 채운다. 사진이 들어오면 그 면이 사진으로 바뀔 뿐 배치는 그대로다.
 *
 * ## 사진이 없을 때 무엇을 그리는가
 *
 * 회색 빈 사각형은 그리지 않는다. 그건 "아직 안 만든 화면"처럼 보인다.
 * 대신 다음을 겹쳐 하나의 면을 만든다.
 *
 *  1. midnight 바탕
 *  2. bronze / navy 두 방향의 radial gradient — 빛이 드는 방향을 만든다
 *  3. 얇은 격자선 — 건축 도면 같은 인상
 *  4. **틀 밖으로 넘치도록 키운 워드마크** — 지면의 주인이 누구인지 남긴다
 *  5. 모서리 눈금 — 사진 자리라는 것을 알려 주는 최소한의 표시
 *
 * 워드마크 문자열은 사전(`dict.site.wordmark`)에서 받는다. 새 문구를 만들지 않는다.
 *
 * ## 영상으로 확장할 때
 *
 * 이 컴포넌트는 "배경 레이어 + overlay + 내용" 세 겹으로만 되어 있다.
 * 배경 레이어를 `<video>` 로 바꾸면 나머지는 그대로 쓸 수 있고,
 * 영상이 재생되지 않는 환경에서는 지금의 fallback 이 그대로 정지 화면이 된다.
 */

type Ratio = "4/5" | "3/4" | "1/1" | "3/2" | "16/9" | "21/9";

const ratioClass: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
};

export function BFrame({
  media,
  ratio = "4/5",
  watermark,
  priority = false,
  sizes = "(min-width: 1024px) 40rem, 100vw",
  className,
  /** 화면 높이를 직접 정할 때. Hero 처럼 비율이 아니라 높이가 기준인 곳. */
  fill = false,
}: {
  media?: MediaView | null;
  ratio?: Ratio;
  watermark?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-midnight",
        !fill && ratioClass[ratio],
        fill && "h-full w-full",
        className,
      )}
    >
      {media ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <BFramePlaceholder watermark={watermark} />
      )}
    </div>
  );
}

/**
 * 사진이 없을 때 채우는 면. 전부 장식이므로 화면 읽기 프로그램에서 숨긴다.
 * 외부 이미지를 내려받지 않고 CSS 만으로 만든다.
 */
export function BFramePlaceholder({ watermark }: { watermark?: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_75%_5%,rgba(168,130,63,0.30),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_0%_100%,rgba(28,51,85,0.75),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-[0.06]" />

      {watermark && (
        // 틀보다 크게 키워 글자가 잘리게 둔다. 잘린 글자가 오히려 면을 만든다.
        <span className="absolute -bottom-[0.12em] -left-[0.04em] font-serif text-[min(28vw,11rem)] leading-none font-bold tracking-[-0.03em] whitespace-nowrap text-white/[0.07]">
          {watermark}
        </span>
      )}

      {/* 모서리 눈금 */}
      <span className="absolute top-5 left-5 h-6 w-px bg-white/25" />
      <span className="absolute top-5 left-5 h-px w-6 bg-white/25" />
      <span className="absolute right-5 bottom-5 h-6 w-px bg-white/25" />
      <span className="absolute right-5 bottom-5 h-px w-6 bg-white/25" />
    </div>
  );
}
