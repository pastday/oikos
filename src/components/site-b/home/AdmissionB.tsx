import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { ContainerB } from "../ContainerB";
import { bPath } from "../paths";
import { ButtonB, SectionHeadB } from "../SectionB";

/**
 * 입학안내 요약.
 *
 * 항목(모집 시기·등록금 등)은 A안 메인과 같은 콘텐츠에서 오며, 그 값들은
 * `SiteSetting` 의 금액·개강 정보를 문장으로 만든 것이다. 여기서 새 숫자를 만들지 않는다.
 * 등록금 표 전체는 입학안내 페이지에서 보여준다.
 */
export function AdmissionB({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { admission } = content;

  return (
    <section className="border-b border-rule bg-paper py-20 lg:py-32">
      <ContainerB>
        <SectionHeadB
          index={7}
          eyebrow={admission.eyebrow}
          title={admission.title}
          description={admission.description}
        />

        <dl className="mt-16 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {admission.items.map((item) => (
            <div key={item.label} className="bg-paper px-7 py-10">
              <dt className="text-[0.625rem] font-semibold tracking-[0.18em] text-quiet uppercase">
                {item.label}
              </dt>
              <dd className="mt-4 font-serif text-2xl leading-tight font-bold text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonB href={bPath(locale, "/admission")} variant="solid">
            {admission.ctaGuide}
          </ButtonB>
          <ButtonB href={bPath(locale, "/consultation")} variant="outline">
            {admission.ctaConsultation}
          </ButtonB>
        </div>
      </ContainerB>
    </section>
  );
}
