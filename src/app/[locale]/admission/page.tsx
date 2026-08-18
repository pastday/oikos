import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { FactGrid, Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import {
  getAdmissionNumbers,
  getPageSections,
  getProgramNumbers,
  getPublishedPrograms,
} from "@/lib/cms/queries";
import { toPageIntro, toPairs, toValues } from "@/lib/cms/page-view";
import { formatKrw } from "@/content/program-facts";
import { isLocale, type Locale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

const PAGE_PATH = "/admission";
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

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: intro.title,
    description: intro.description,
  });
}

/**
 * 금액을 표 칸에 넣을 문자열로 만든다.
 *
 * 값이 없으면 **"-"** 다. 원본 자료에 금액이 적혀 있지 않은 항목(LMS 사용료)이 실제로 있고,
 * 그 상태를 그대로 보여 주는 것이 원본에 없는 금액을 지어내는 것보다 정확하다.
 */
function money(amount: number | null, locale: Locale): string {
  return amount === null ? "-" : formatKrw(amount, locale);
}

/**
 * 입학안내.
 *
 * 문구는 `PageSection`, 금액·개강은 `SiteSetting`, 과정 이름은 `Program` 에서 온다.
 * 등록금 표는 이 셋을 합쳐 만든다. 표의 열 제목만 정적 문구다.
 * (어떤 금액이 어느 열인지는 화면 구조에 속하므로 관리자가 바꿀 대상이 아니다)
 */
export default async function AdmissionPage({ params }: PageProps) {
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
      <PageHero intro={toPageIntro(sections.intro, content.intro)} />

      {recruit && recruit.items.length > 0 && (
        <Section
          title={recruit.title ?? undefined}
          description={recruit.subtitle ?? undefined}
        >
          <FactGrid items={toPairs(recruit.items)} columns={4} />
        </Section>
      )}

      {eligibility && (
        <Section title={eligibility.title ?? undefined} tone="surface">
          <Prose paragraphs={eligibility.paragraphs} />
          {eligibility.note && (
            <p className="mt-5 text-sm text-muted">{eligibility.note}</p>
          )}
        </Section>
      )}

      {tuition && (
        <Section
          title={tuition.title ?? undefined}
          description={tuition.subtitle ?? undefined}
        >
          {/* 좁은 화면에서는 표가 가로로 스크롤되며, 텍스트가 잘리지 않는다. */}
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">
                {tuition.title ?? content.tuition.title}
              </caption>
              <thead>
                <tr className="border-b-2 border-navy">
                  {content.tuition.columns.map((column, index) => (
                    <th
                      key={column}
                      scope="col"
                      className={cn(
                        "px-4 py-3 font-semibold whitespace-nowrap text-navy",
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
                  <tr key={row.program} className="border-b border-line">
                    <th
                      scope="row"
                      className="px-4 py-4 text-left font-semibold whitespace-nowrap text-foreground/85"
                    >
                      {row.program}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td
                        key={`${row.program}-${index}`}
                        className="px-4 py-4 text-right whitespace-nowrap text-foreground/80"
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
            <ul className="mt-6 space-y-2">
              {toValues(tuition.items).map((note) => (
                <li key={note.id} className="flex gap-2 text-xs text-muted">
                  <span aria-hidden="true">·</span>
                  {note.value}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {steps && steps.items.length > 0 && (
        <Section
          title={steps.title ?? undefined}
          description={steps.subtitle ?? undefined}
          tone="surface"
        >
          <ol className="grid gap-4 lg:grid-cols-5">
            {toPairs(steps.items).map((step, index) => (
              <li
                key={step.id}
                className="flex flex-col rounded-lg border border-line bg-background p-5"
              >
                <span className="font-serif text-xs font-bold tracking-[0.15em] text-gold">
                  STEP {index + 1}
                </span>
                <h3 className="mt-2.5 text-[0.9375rem] font-semibold text-navy">
                  {step.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {step.value}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {calendar && calendar.items.length > 0 && (
        <Section
          title={calendar.title ?? undefined}
          description={calendar.subtitle ?? undefined}
        >
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calendar.items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border px-5 py-4",
                  item.variant === "semester"
                    ? "border-navy/20 bg-navy-tint"
                    : "border-line bg-surface",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    item.variant === "semester" ? "text-navy" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
                <span className="text-sm text-foreground/75">{item.value}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <RelatedLinks
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
