import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB } from "../SectionB";

/**
 * 학위 및 인증으로 보내는 영역.
 *
 * BPPE·TRACS·CHEA 같은 인증 기관의 로고 이미지는 프로젝트에 제공된 적이 없다.
 * 인터넷에서 내려받아 넣지 않는다. (13단계 지시 19·23항)
 * 그래서 여기서는 문구와 선만으로 구성하고, 세부 내용은 학위/인증 페이지에서 다룬다.
 */
export function DegreeB({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { degree } = content;

  return (
    <section className="border-b border-rule bg-ink py-20 text-white lg:py-28">
      <ContainerB>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4">
              <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze-2">
                06
              </span>
              <span aria-hidden="true" className="h-px w-10 bg-bronze-2/60" />
              <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-bronze-2 uppercase">
                {degree.eyebrow}
              </p>
            </div>

            <h2 className="mt-6 max-w-2xl font-serif text-3xl leading-[1.15] font-bold text-balance sm:text-4xl">
              {degree.title}
            </h2>

            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.9] text-white/70">
              {degree.description}
            </p>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <ButtonB href={bPath(locale, "/degree")} variant="onDark">
              {degree.cta}
            </ButtonB>
          </div>
        </div>
      </ContainerB>
    </section>
  );
}
