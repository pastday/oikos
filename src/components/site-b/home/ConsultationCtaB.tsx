import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB } from "../SectionB";

/**
 * 페이지 하단 입학상담 CTA.
 *
 * A안보다 강한 면으로 만들되 **문구는 그대로**다. 과장된 영업 문구를 새로 쓰지 않는다.
 * (13단계 지시 21항) 차이는 크기·여백·글자 크기에서만 만든다.
 */
export function ConsultationCtaB({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { consultation } = content;

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white lg:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_20%_0%,rgba(168,130,63,0.2),transparent_60%)]"
      />

      <ContainerB className="relative">
        <div className="max-w-3xl">
          <h2 className="font-serif text-4xl leading-[1.1] font-bold text-balance sm:text-5xl lg:text-6xl">
            {consultation.title}
          </h2>
          <p className="mt-8 text-lg leading-[1.9] text-white/70">
            {consultation.description}
          </p>
        </div>

        <div className="mt-12">
          <ButtonB href={bPath(locale, "/consultation")} variant="onDark">
            {consultation.cta}
          </ButtonB>
        </div>
      </ContainerB>
    </section>
  );
}
