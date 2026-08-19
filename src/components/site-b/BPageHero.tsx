import type { PageIntro } from "@/content/pages";
import type { MediaView } from "@/lib/cms/types";
import { BFrame } from "./BFrame";
import { BContainer } from "./BLayout";
import { BDisplay, BEyebrow, BLead } from "./BType";

/**
 * B안 상세 페이지의 상단.
 *
 * 메인 Hero 와 **같은 구조를 축소한 것**이다.
 * 왼쪽에 글자, 오른쪽에 화면 끝까지 닿는 비주얼 자리.
 * 그래서 메인에서 상세로 들어가도 같은 사이트로 읽힌다. (상세만 A안처럼 보이면 실패다)
 *
 * A안의 상세 상단은 네이비 띠 안에 eyebrow·제목·설명을 왼쪽 정렬로 쌓은 것이고
 * 이미지 자리가 없다. 구조가 다르다.
 *
 * `media` 를 주면 그 페이지의 CMS 이미지가 비주얼 자리에 들어간다.
 * 없으면 `BFrame` 이 만든 면이 그대로 남는다. 빈 회색 사각형은 그리지 않는다.
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
  return (
    <section className="relative flex min-h-[62vh] flex-col bg-midnight text-white lg:min-h-[68vh]">
      <div className="absolute inset-y-0 right-0 hidden w-[36%] lg:block">
        <BFrame
          media={media}
          staticSrc={staticSrc}
          watermark={watermark}
          fill
          sizes="40vw"
          priority
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,15,1)_0%,rgba(4,8,15,0.4)_30%,transparent_65%)]"
        />
      </div>

      <BContainer className="relative flex flex-1 flex-col justify-end pt-32 pb-16 lg:pt-40 lg:pb-20 lg:pr-[40%]">
        <div className="flex items-center gap-5">
          {index !== undefined && (
            <span className="font-serif text-sm font-bold tabular-nums text-bronze-2">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span aria-hidden="true" className="h-px w-10 bg-white/25" />
          {intro.eyebrow && <BEyebrow tone="dark">{intro.eyebrow}</BEyebrow>}
        </div>

        <BDisplay as="h1" tone="dark" className="mt-8 max-w-[15ch]">
          {intro.title}
        </BDisplay>

        {intro.description && (
          <BLead tone="dark" className="mt-8 max-w-2xl">
            {intro.description}
          </BLead>
        )}
      </BContainer>

      <div className="relative lg:hidden">
        <BFrame
          media={media}
          staticSrc={staticSrc}
          watermark={watermark}
          ratio="21/9"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
