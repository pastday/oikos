import type { HomeContent } from "@/content/home";
import { ContainerB } from "../ContainerB";

/**
 * 100% 온라인.
 *
 * B안에서는 이 사실을 **화면을 가로지르는 큰 글자**로 내세운다. (13단계 지시 16항)
 * 다만 원본 자료에 없는 표현을 새로 만들지 않는다. 문구는 A안 메인과 같은 것이고,
 * `100% ONLINE` 이라는 큰 글자도 콘텐츠의 `badge` 값을 그대로 쓴 것이다.
 */
export function OnlineB({ content }: { content: HomeContent }) {
  const { online } = content;

  return (
    <section className="relative overflow-hidden border-b border-rule bg-paper py-20 lg:py-32">
      {/* 배경으로 크게 깔리는 문구. 장식이므로 스크린리더에서 숨긴다. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 text-center font-serif text-[22vw] leading-none font-bold tracking-tight text-ink/[0.04] select-none"
      >
        {online.badge}
      </span>

      <ContainerB className="relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-bronze/50" />
              <p className="text-[0.6875rem] font-semibold tracking-[0.24em] text-bronze uppercase">
                {online.badge}
              </p>
            </div>

            <h2 className="mt-6 max-w-2xl font-serif text-3xl leading-[1.15] font-bold text-balance text-ink sm:text-4xl lg:text-[2.75rem]">
              {online.title}
            </h2>

            <p className="mt-8 max-w-xl text-[1.0625rem] leading-[1.95] text-ink/75">
              {online.description}
            </p>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-quiet uppercase">
              {online.scheduleTitle}
            </h3>

            <ul className="mt-6 border-t border-rule">
              {online.schedule.map((item) => (
                <li
                  key={item}
                  className="border-b border-rule py-4 font-serif text-lg text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContainerB>
    </section>
  );
}
