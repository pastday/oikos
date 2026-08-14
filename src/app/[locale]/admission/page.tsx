import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { FactGrid, Prose, Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

const PAGE_PATH = "/admission";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale).admission;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function AdmissionPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale);
  const content = pages.admission;

  return (
    <>
      <PageHero intro={content.intro} />

      <Section
        title={content.recruit.title}
        description={content.recruit.description}
      >
        <FactGrid items={content.recruit.items} columns={4} />
      </Section>

      <Section title={content.eligibility.title} tone="surface">
        <Prose paragraphs={content.eligibility.paragraphs} />
        <p className="mt-5 text-sm text-muted">{content.eligibility.note}</p>
      </Section>

      <Section
        title={content.tuition.title}
        description={content.tuition.description}
      >
        {/* 좁은 화면에서는 표가 가로로 스크롤되며, 텍스트가 잘리지 않는다. */}
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">{content.tuition.title}</caption>
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
              {content.tuition.rows.map((row) => (
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

        <ul className="mt-6 space-y-2">
          {content.tuition.notes.map((note) => (
            <li key={note} className="flex gap-2 text-xs text-muted">
              <span aria-hidden="true">·</span>
              {note}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title={content.steps.title}
        description={content.steps.description}
        tone="surface"
      >
        <ol className="grid gap-4 lg:grid-cols-5">
          {content.steps.items.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col rounded-lg border border-line bg-background p-5"
            >
              <span className="font-serif text-xs font-bold tracking-[0.15em] text-gold">
                STEP {index + 1}
              </span>
              <h3 className="mt-2.5 text-[0.9375rem] font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title={content.calendar.title}
        description={content.calendar.description}
      >
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.calendar.items.map((item) => (
            <li
              key={`${item.label}-${item.period}`}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg border px-5 py-4",
                item.type === "semester"
                  ? "border-navy/20 bg-navy-tint"
                  : "border-line bg-surface",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  item.type === "semester" ? "text-navy" : "text-muted",
                )}
              >
                {item.label}
              </span>
              <span className="text-sm text-foreground/75">{item.period}</span>
            </li>
          ))}
        </ol>
      </Section>

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
