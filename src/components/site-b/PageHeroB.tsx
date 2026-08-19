import type { PageIntro } from "@/content/pages";
import { ContainerB } from "./ContainerB";

/**
 * B안 상세 페이지의 상단.
 *
 * Header 가 `fixed` 로 겹쳐 있으므로 **모든 상세 페이지는 이 어두운 영역으로 시작**한다.
 * 그래야 투명 Header 의 흰 글자가 항상 읽히고, 홈의 Hero 와 같은 계열로 보인다.
 *
 * 문구는 CMS(`PageSection`) 또는 콘텐츠 파일에서 온 것을 그대로 받는다.
 * A안과 완전히 같은 값을 쓰며 여기서 바꾸지 않는다.
 */
export function PageHeroB({ intro }: { intro: PageIntro }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* 사진이 없는 상태에서도 깊이가 생기도록 겹친 gradient 로 면을 만든다.
          나중에 Media 가 연결되면 이 자리에 이미지를 깔고 gradient 는 overlay 가 된다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_0%,rgba(168,130,63,0.22),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0)_40%,rgba(8,17,31,0.6)_100%)]"
      />

      <ContainerB className="relative pt-36 pb-20 lg:pt-44 lg:pb-28">
        {intro.eyebrow && (
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-bronze-2/60" />
            <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-bronze-2 uppercase">
              {intro.eyebrow}
            </p>
          </div>
        )}

        <h1 className="mt-7 max-w-4xl font-serif text-4xl leading-[1.1] font-bold text-balance sm:text-5xl lg:text-6xl">
          {intro.title}
        </h1>

        {intro.description && (
          <p className="mt-8 max-w-2xl text-base leading-[1.9] text-white/70">
            {intro.description}
          </p>
        )}
      </ContainerB>
    </section>
  );
}
