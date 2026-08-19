import type { HomeContent } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { BButton } from "@/components/site-b/BBlocks";
import { BFrame } from "@/components/site-b/BFrame";
import { designBImages } from "@/components/site-b/images";
import { BContainer } from "@/components/site-b/BLayout";
import { BEyebrow, BHeadline, BLead, BMega } from "@/components/site-b/BType";
import { bPath } from "@/components/site-b/paths";

/**
 * 입학안내 요약.
 *
 * ## 구조
 *
 * 왼쪽에 **개강 시점을 화면 크기 글자로** 세우고 그 아래에 나머지 정보와 버튼을 둔다.
 * 오른쪽은 세로로 긴 사진이 지면 오른쪽 끝까지 닿는다.
 * 지원자가 가장 먼저 알아야 하는 것이 "언제 시작하는가"이므로 그것을 가장 크게 두고,
 * 사진이 옆에서 같은 높이를 채워 한쪽만 비는 일이 없게 한다.
 *
 * 값은 전부 A안 메인과 같은 콘텐츠에서 오고, 그 콘텐츠는 `SiteSetting` 의
 * 금액·개강 정보로 만들어진다. 여기서 새 숫자를 만들지 않는다.
 */
export function BAdmissionBand({
  locale,
  content,
  watermark,
}: {
  locale: Locale;
  content: HomeContent;
  watermark: string;
}) {
  const { admission } = content;
  const [headline, ...rest] = admission.items;

  return (
    <section className="border-t border-rule bg-paper py-20 lg:py-28">
      <BContainer>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <BEyebrow>{admission.eyebrow}</BEyebrow>

            {headline && (
              // `text-mega` 가 cqi 단위라 이 칸에 `@container` 가 필요하다.
              // 값이 "2026년 10월" 처럼 두 낱말일 수 있어 nowrap 은 켜지 않는다.
              <div className="@container mt-8">
                <p className="text-[0.625rem] font-semibold tracking-[0.22em] text-quiet uppercase">
                  {headline.label}
                </p>
                <BMega tone="light" className="mt-3">
                  {headline.value}
                </BMega>
              </div>
            )}

            <div className="mt-10 max-w-xl">
              <BHeadline size="small">{admission.title}</BHeadline>
              <BLead className="mt-4">{admission.description}</BLead>
            </div>

            <dl className="mt-10 grid gap-x-10 border-t border-rule sm:grid-cols-3">
              {rest.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-rule py-4 sm:block sm:border-b-0 sm:py-5"
                >
                  <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
                    {item.label}
                  </dt>
                  <dd className="font-serif text-xl font-bold text-ink sm:mt-2 sm:text-2xl">
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

          {/* 오른쪽 사진은 지면 오른쪽 끝까지 흘려 보낸다. */}
          <div className="lg:col-span-5">
            <BFrame
              staticSrc={designBImages.heroCampus}
              watermark={watermark}
              ratio="3/4"
              className="-mx-6 sm:-mx-10 lg:mx-0 lg:-mr-14"
              sizes="(min-width: 1024px) 34rem, 100vw"
            />
          </div>
        </div>
      </BContainer>
    </section>
  );
}
