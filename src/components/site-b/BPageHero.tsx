import Image from "next/image";
import type { PageIntro } from "@/content/pages";
import type { MediaView } from "@/lib/cms/types";
import { BFramePlaceholder } from "./BFrame";
import { BContainer } from "./BLayout";
import { BDisplay, BEyebrow, BLead } from "./BType";

/**
 * B안 상세 페이지의 상단.
 *
 * 메인 Hero 와 **같은 방식**이다. 사진이 영역 전체를 덮고 그 위에
 * 왼쪽이 진한 가로 gradient 가 얹힌다. 그래서 메인에서 상세로 들어가도
 * 같은 사이트로 읽히고, 어느 쪽에도 잘린 검은 사각형이 생기지 않는다.
 *
 * 사진이 없는 페이지(FAQ·상담 등)는 `BFramePlaceholder` 가 만든 면이 그대로 남는다.
 * 억지로 사진을 넣지 않는다.
 *
 * 그림의 출처 우선순위는 `BFrame` 과 같다. CMS Media → 시안용 정적 이미지 → CSS 면.
 */
export function BPageHero({
  intro,
  index,
  media = null,
  staticSrc,
  watermark,
}: {
  intro: PageIntro;
  /** 레일과 같은 규칙의 페이지 번호. 없으면 표시하지 않는다. */
  index?: number;
  media?: MediaView | null;
  /** 시안용 정적 이미지. CMS Media 가 있으면 무시된다. */
  staticSrc?: string;
  watermark: string;
}) {
  const background = media
    ? { src: media.url, alt: media.alt }
    : staticSrc
      ? { src: staticSrc, alt: "" }
      : null;

  return (
    <section className="relative flex min-h-[58vh] flex-col justify-end overflow-hidden bg-midnight text-white lg:min-h-[64vh]">
      {background ? (
        <Image
          src={background.src}
          alt={background.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      ) : (
        <BFramePlaceholder watermark={watermark} />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,15,0.95)_0%,rgba(4,8,15,0.88)_30%,rgba(4,8,15,0.60)_62%,rgba(4,8,15,0.30)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.72)_0%,rgba(4,8,15,0.15)_35%,rgba(4,8,15,0.55)_100%)]"
      />

      <BContainer className="relative pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="max-w-2xl lg:max-w-[58%]">
          <div className="flex items-center gap-5">
            {index !== undefined && (
              <span className="font-serif text-sm font-bold tabular-nums text-bronze-2">
                {String(index).padStart(2, "0")}
              </span>
            )}
            <span aria-hidden="true" className="h-px w-10 bg-white/30" />
            {intro.eyebrow && <BEyebrow tone="dark">{intro.eyebrow}</BEyebrow>}
          </div>

          <BDisplay
            as="h1"
            tone="dark"
            className="mt-8 [text-shadow:0_2px_24px_rgba(4,8,15,0.55)]"
          >
            {intro.title}
          </BDisplay>

          {intro.description && (
            <BLead tone="dark" className="mt-8 text-white/80">
              {intro.description}
            </BLead>
          )}
        </div>
      </BContainer>
    </section>
  );
}
