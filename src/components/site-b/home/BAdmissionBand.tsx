import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { BButton } from "@/components/site-b/BBlocks";
import { BContainer } from "@/components/site-b/BLayout";
import { BEyebrow, BHeadline, BLead, BMega } from "@/components/site-b/BType";
import { bPath } from "@/components/site-b/paths";

/**
 * 입학안내 요약.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 항목 4개를 같은 크기 칸에 넣었다. 무엇이 중요한지 알 수 없었다.
 * 지금은 **첫 항목(개강 시점)을 화면을 가로지르는 큰 글자로 올리고**
 * 나머지를 그 아래 가로선 목록으로 둔다.
 * 지원자가 가장 먼저 알아야 하는 것이 "언제 시작하는가"이기 때문이다.
 *
 * 값은 전부 A안 메인과 같은 콘텐츠에서 오고, 그 콘텐츠는 `SiteSetting` 의
 * 금액·개강 정보로 만들어진다. 여기서 새 숫자를 만들지 않는다.
 */
export function BAdmissionBand({
  locale,
  content,
}: {
  locale: Locale;
  content: HomeContent;
}) {
  const { admission } = content;
  const [headline, ...rest] = admission.items;

  return (
    <section className="border-t border-rule bg-paper py-20 lg:py-32">
      <BContainer>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <BEyebrow>{admission.eyebrow}</BEyebrow>

            {headline && (
              <>
                <p className="mt-10 text-[0.625rem] font-semibold tracking-[0.22em] text-quiet uppercase">
                  {headline.label}
                </p>
                <BMega tone="light" className="mt-4">
                  {headline.value}
                </BMega>
              </>
            )}
          </div>

          <div className="lg:col-span-5">
            <BHeadline>{admission.title}</BHeadline>
            <BLead className="mt-6">{admission.description}</BLead>

            <dl className="mt-10 border-t border-rule">
              {rest.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-6 border-b border-rule py-5"
                >
                  <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
                    {item.label}
                  </dt>
                  <dd className="font-serif text-xl font-bold text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <BButton href={bPath(locale, "/admission")} tone="solid">
                {admission.ctaGuide}
              </BButton>
              <BButton href={bPath(locale, "/consultation")} tone="outline">
                {admission.ctaConsultation}
              </BButton>
            </div>
          </div>
        </div>
      </BContainer>
    </section>
  );
}
