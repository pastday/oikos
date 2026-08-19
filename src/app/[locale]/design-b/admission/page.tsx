import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { DocumentLinkB, SectionImageB } from "@/components/site-b/MediaBlocksB";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import {
  FactGridB,
  ProseB,
  SectionB,
  SectionHeadB,
} from "@/components/site-b/SectionB";
import { getPageContent } from "@/content/pages";
import { formatKrw } from "@/content/program-facts";
import { isLocale, type Locale } from "@/i18n/config";
import { toPageIntro, toPairs, toValues } from "@/lib/cms/page-view";
import {
  getAdmissionNumbers,
  getPageSections,
  getProgramNumbers,
  getPublishedPrograms,
} from "@/lib/cms/queries";
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
 * 문구는 `PageSection`, 금액·개강은 `SiteSetting`, 과정 이름은 `Program` 에서 온다.
 * **A안과 완전히 같은 값**이며 표를 만드는 규칙도 같다. (13단계 지시 21·31항)
 * 모집요강 PDF 는 관리자가 지정했을 때만 버튼이 나온다.
 */
export default async function DesignBAdmissionPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [sections, numbers, amounts, programs] = await Promise.all([
    getPageSections(PAGE_KEY, locale),
    getProgramNumbers(),
    getAdmissionNumbers(),
    getPublishedPrograms(locale),
  ]);

  const pages = getPageContent(locale, numbers);
  const content = pages.admission;

  const recruit = sections.recruit;
  const eligibility = sections.eligibility;
  const tuition = sections.tuition;
  const steps = sections.steps;
  const calendar = sections.calendar;

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
      <PageHeroB intro={toPageIntro(sections.intro, content.intro)} />

      {recruit &&
        (recruit.items.length > 0 || recruit.media || recruit.document) && (
          <SectionB>
            <SectionHeadB
              index={1}
              title={recruit.title ?? ""}
              description={recruit.subtitle ?? undefined}
            />

            {recruit.media && (
              <SectionImageB media={recruit.media} className="mt-12" />
            )}

            {recruit.items.length > 0 && (
              <div className="mt-14">
                <FactGridB items={toPairs(recruit.items)} columns={4} />
              </div>
            )}

            {/* 지정되지 않았으면 버튼 자체를 그리지 않는다. 404 링크를 보여주지 않는다. */}
            {recruit.document && (
              <div className="mt-12">
                <DocumentLinkB
                  media={recruit.document}
                  label={content.guideline.label}
                  newWindowLabel={content.guideline.newWindow}
                />
              </div>
            )}
          </SectionB>
        )}

      {eligibility && (
        <SectionB tone="paper-2">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeadB index={2} title={eligibility.title ?? ""} />
            </div>
            <div className="lg:col-span-7">
              <ProseB paragraphs={eligibility.paragraphs} />
              {eligibility.note && (
                <p className="mt-8 text-sm text-quiet">{eligibility.note}</p>
              )}
            </div>
          </div>
        </SectionB>
      )}

      {tuition && (
        <SectionB>
          <SectionHeadB
            index={3}
            title={tuition.title ?? ""}
            description={tuition.subtitle ?? undefined}
          />

          {/* 좁은 화면에서는 표가 가로로 스크롤된다. 글자를 줄이거나 자르지 않는다. */}
          <div className="mt-14 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
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
                        "px-5 py-4 text-[0.6875rem] font-semibold tracking-[0.14em] whitespace-nowrap text-ink uppercase",
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
                      className="px-5 py-6 text-left font-serif text-lg font-bold whitespace-nowrap text-ink"
                    >
                      {row.program}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td
                        key={`${row.program}-${index}`}
                        className="px-5 py-6 text-right whitespace-nowrap text-ink/80"
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
                    className="mt-2 h-px w-2.5 shrink-0 bg-rule-2"
                  />
                  {note.value}
                </li>
              ))}
            </ul>
          )}
        </SectionB>
      )}

      {steps && steps.items.length > 0 && (
        <SectionB tone="ink">
          <SectionHeadB
            index={4}
            title={steps.title ?? ""}
            description={steps.subtitle ?? undefined}
            tone="dark"
          />

          <ol className="mt-14 grid gap-px bg-white/15 lg:grid-cols-5">
            {toPairs(steps.items).map((step, index) => (
              <li key={step.id} className="flex flex-col bg-ink px-6 py-9">
                <span className="text-[0.625rem] font-semibold tracking-[0.2em] text-bronze-2 uppercase">
                  STEP {index + 1}
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-white">
                  {step.label}
                </h3>
                <p className="mt-3 text-xs leading-[1.9] text-white/60">
                  {step.value}
                </p>
              </li>
            ))}
          </ol>
        </SectionB>
      )}

      {calendar && calendar.items.length > 0 && (
        <SectionB tone="paper-2">
          <SectionHeadB
            index={5}
            title={calendar.title ?? ""}
            description={calendar.subtitle ?? undefined}
          />

          <ol className="mt-14 border-t border-rule">
            {calendar.items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex flex-wrap items-baseline justify-between gap-4 border-b border-rule py-5",
                  item.variant === "semester" ? "" : "opacity-75",
                )}
              >
                <span
                  className={cn(
                    "font-serif text-lg font-bold",
                    item.variant === "semester" ? "text-ink" : "text-quiet",
                  )}
                >
                  {item.label}
                </span>
                <span className="text-sm tracking-wide text-ink/70">
                  {item.value}
                </span>
              </li>
            ))}
          </ol>
        </SectionB>
      )}

      <RelatedLinksB
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
