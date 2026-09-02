import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BAdmissionFeeNotice } from "@/components/site-b/BAdmissionFeeNotice";
import { BAdmissionResources } from "@/components/site-b/BAdmissionResources";
import { BDocumentLink } from "@/components/site-b/BDocumentLink";
import { BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import {
  BBody,
  BEyebrow,
  BHeadline,
  BMega,
} from "@/components/site-b/BType";
import { designBImages } from "@/components/site-b/images";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { getPageContent } from "@/content/pages";
import { formatKrw } from "@/content/program-facts";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { toPageIntro, toPairs, toValues } from "@/lib/cms/page-view";
import {
  getAdmissionNumbers,
  getPageSections,
  getProgramNumbers,
  getPublishedPrograms,
} from "@/lib/cms/queries";
import { getAdmissionResources } from "@/lib/cms/resources";
import { getAdmissionFeeDisplay } from "@/lib/cms/admission-fee";
import { cn } from "@/lib/cn";

const PAGE_KEY = "admission";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const [sections, numbers] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
  ]);

  const intro = toPageIntro(
    sections.intro,
    getPageContent(locale, numbers).admission.intro,
  );

  return buildDesignBMetadata({
    title: intro.title,
    description: intro.description,
  });
}

/**
 * 금액을 표 칸에 넣을 문자열로 만든다.
 *
 * 값이 없으면 **"-"** 다. 원본 자료에 금액이 적혀 있지 않은 항목(LMS 사용료)이 실제로 있고,
 * 그 상태를 그대로 보여 주는 것이 원본에 없는 금액을 지어내는 것보다 정확하다.
 * (A안과 완전히 같은 규칙이다)
 */
function money(amount: number | null, locale: Locale): string {
  return amount === null ? "-" : formatKrw(amount, locale);
}

/**
 * B안 입학안내.
 *
 * ## A안과 무엇이 다른가
 *
 * A안은 모집 정보 → 지원자격 → 등록금표 → 절차 카드 → 학사일정 카드가
 * 모두 같은 굵기로 이어진다. B안은 **모집 시기를 화면 크기로 먼저 보여주고**
 * 나머지를 그 아래에 선으로 나눠 둔다. 대학 입학안내 페이지가 실제로 그렇게 생겼다.
 *
 * 값의 출처는 A안과 같다. 문구는 `PageSection`, 금액·개강은 `SiteSetting`,
 * 과정 이름은 `Program`. 여기서 새 숫자를 만들지 않는다.
 */
export default async function DesignBAdmissionPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [
    sections,
    numbers,
    amounts,
    programs,
    admissionResources,
    admissionFee,
  ] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
    getAdmissionNumbers(),
    getPublishedPrograms(locale),
    getAdmissionResources(locale),
    getAdmissionFeeDisplay(),
  ]);

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, numbers);
  const content = pages.admission;
  const watermark = dict.site.wordmark;

  const recruit = sections.recruit;
  const eligibility = sections.eligibility;
  const tuition = sections.tuition;
  const steps = sections.steps;
  const calendar = sections.calendar;

  const recruitItems = recruit ? toPairs(recruit.items) : [];
  // 첫 항목(모집 시기)은 크게 세우고 나머지는 띠로 둔다.
  const [headline, ...restItems] = recruitItems;

  // 표는 원본 자료와 같은 순서(DBA → MBA)로 둔다.
  const tuitionRows = ["DBA", "MBA"].flatMap((type) => {
    const program = programs.find((item) => item.type === type);
    if (!program) return [];

    return [
      {
        program: program.name,
        cells: [
          money(amounts[`tuition.${type.toLowerCase()}`] ?? null, locale),
          money(amounts["fee.admissionReview"] ?? null, locale),
          money(amounts["fee.lms"] ?? null, locale),
          money(amounts["fee.administrative"] ?? null, locale),
        ],
      },
    ];
  });

  return (
    <>
      <BPageHero
        intro={toPageIntro(sections.intro, content.intro)}
        index={7}
        media={recruit?.media ?? null}
        staticSrc={designBImages.programs}
        watermark={watermark}
      />

      {recruit &&
        (recruitItems.length > 0 || recruit.document) && (
          <BSection index={1} label={recruit.title ?? undefined} tone="paper">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
              {/* `text-mega` 가 cqi 단위라 이 칸에 `@container` 가 필요하다. */}
              <div className="@container lg:col-span-7">
                {headline && (
                  <>
                    <BEyebrow>{headline.label}</BEyebrow>
                    <BMega tone="light" className="mt-6">
                      {headline.value}
                    </BMega>
                  </>
                )}
              </div>

              <div className="lg:col-span-5">
                <BHeadline size="small">{recruit.title ?? ""}</BHeadline>
                {recruit.subtitle && (
                  <p className="mt-5 text-[0.9375rem] leading-[1.85] text-quiet">
                    {recruit.subtitle}
                  </p>
                )}

                {restItems.length > 0 && (
                  <dl className="mt-10 border-t border-rule">
                    {restItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-baseline justify-between gap-6 border-b border-rule py-5"
                      >
                        <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
                          {item.label}
                        </dt>
                        <dd className="text-right font-serif text-lg font-bold text-ink">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            {/* 지정되지 않았으면 버튼 자체를 그리지 않는다. 404 링크를 보여주지 않는다. */}
            {recruit.document && (
              <div className="mt-14">
                <BDocumentLink
                  media={recruit.document}
                  label={content.guideline.label}
                  newWindowLabel={content.guideline.newWindow}
                />
              </div>
            )}
          </BSection>
        )}

      {eligibility && (
        <BSection index={2} label={eligibility.title ?? undefined} tone="stone">
          <BHeadline>{eligibility.title ?? ""}</BHeadline>
          <div className="mt-10">
            <BBody paragraphs={eligibility.paragraphs} columns={2} />
          </div>
          {eligibility.note && (
            <p className="mt-10 max-w-[62ch] text-sm leading-relaxed text-quiet">
              {eligibility.note}
            </p>
          )}
        </BSection>
      )}

      {tuition && (
        <BSection index={3} label={tuition.title ?? undefined} tone="paper">
          <BHeadline>{tuition.title ?? ""}</BHeadline>
          {tuition.subtitle && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-quiet">
              {tuition.subtitle}
            </p>
          )}

          {/* 좁은 화면에서는 표가 가로로 스크롤된다. 글자를 줄이거나 자르지 않는다. */}
          <div className="mt-12 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[46rem] border-collapse">
              <caption className="sr-only">
                {tuition.title ?? content.tuition.title}
              </caption>
              <thead>
                <tr className="border-b border-ink">
                  {content.tuition.columns.map((column, index) => (
                    <th
                      key={column}
                      scope="col"
                      className={cn(
                        "px-4 py-4 text-[0.625rem] font-semibold tracking-[0.18em] whitespace-nowrap text-quiet uppercase",
                        index === 0 ? "text-left" : "text-right",
                      )}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tuitionRows.map((row) => (
                  <tr key={row.program} className="border-b border-rule">
                    <th
                      scope="row"
                      className="px-4 py-7 text-left font-serif text-xl font-bold whitespace-nowrap text-ink"
                    >
                      {row.program}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td
                        key={`${row.program}-${index}`}
                        className="px-4 py-7 text-right font-serif text-lg whitespace-nowrap text-ink/85"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tuition.items.length > 0 && (
            <ul className="mt-8 space-y-2.5">
              {toValues(tuition.items).map((note) => (
                <li key={note.id} className="flex gap-3 text-xs text-quiet">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-3 shrink-0 bg-rule-2"
                  />
                  {note.value}
                </li>
              ))}
            </ul>
          )}
        </BSection>
      )}

      {steps && steps.items.length > 0 && (
        <BSection index={4} label={steps.title ?? undefined} tone="ink">
          <BHeadline tone="dark">{steps.title ?? ""}</BHeadline>
          {steps.subtitle && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-white/70">
              {steps.subtitle}
            </p>
          )}

          <ol className="mt-12 border-t border-white/15">
            {toPairs(steps.items).map((step, index) => (
              <li key={step.id} className="border-b border-white/15">
                <div className="grid gap-4 py-8 lg:grid-cols-12 lg:items-baseline lg:gap-10">
                  <span
                    aria-hidden="true"
                    className="font-serif text-sm font-bold tabular-nums text-bronze-2 lg:col-span-1"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white lg:col-span-4">
                    {step.label}
                  </h3>
                  <p className="max-w-[62ch] text-[0.9375rem] leading-[1.9] text-white/65 lg:col-span-7">
                    {step.value}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </BSection>
      )}

      {calendar && calendar.items.length > 0 && (
        <BSection index={5} label={calendar.title ?? undefined} tone="stone">
          <BHeadline>{calendar.title ?? ""}</BHeadline>
          {calendar.subtitle && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.85] text-quiet">
              {calendar.subtitle}
            </p>
          )}

          <ol className="mt-12 border-t border-rule-2/60">
            {calendar.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-4 border-b border-rule-2/60 py-6"
              >
                <span
                  className={cn(
                    "font-serif font-bold",
                    item.variant === "semester"
                      ? "text-2xl text-ink"
                      : "text-lg text-quiet",
                  )}
                >
                  {item.label}
                </span>
                <span className="text-sm tracking-[0.08em] text-ink/70">
                  {item.value}
                </span>
              </li>
            ))}
          </ol>
        </BSection>
      )}

      {/* 입학허가비 안내. 금액·절차만. 계좌정보는 최종 제출 성공 화면에서만. (지시 8·20항) */}
      <BAdmissionFeeNotice
        enabled={admissionFee.enabled}
        index={6}
        amountFormatted={formatKrw(admissionFee.amount, locale)}
        content={content.admissionFee}
      />

      {/* 입학 관련 서류 다운로드. 온라인 입학신청·입학상담과 별도 영역이다. (자료실 지시 18항) */}
      <BAdmissionResources
        locale={locale}
        index={7}
        items={admissionResources}
        labels={{
          sectionTitle: dict.resources.admissionSectionTitle,
          download: dict.resources.downloadLabel,
          viewDetail: dict.resources.viewDetail,
          fileCount: dict.resources.fileCountLabel,
          viewAll: dict.resources.viewAll,
        }}
      />

      <BRelated
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/programs/mba", label: pages.related.mba },
          { path: "/programs/dba", label: pages.related.dba },
          { path: "/faq", label: pages.related.faq },
          {
            path: "/consultation",
            label: pages.related.consultation,
            primary: true,
          },
        ]}
      />
    </>
  );
}
