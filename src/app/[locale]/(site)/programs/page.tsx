import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Prose, Section } from "@/components/page/Section";
import { getHomeContent } from "@/content/home";
import { getPageContent } from "@/content/pages";
import { getProgramNumbers, getPublishedPrograms } from "@/lib/cms/queries";
import { buildProgramCardFacts } from "@/lib/cms/present";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

const PAGE_PATH = "/programs";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);
  const home = getHomeContent(locale);

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: dict.pages.programs.title,
    description: home.programs.description,
  });
}

/**
 * MBA · DBA 과정 허브.
 * 상단 메뉴가 가리키는 페이지이므로 두 과정 요약과 전공 소개를 두고
 * 각 상세 페이지로 연결한다. 콘텐츠는 메인 페이지와 동일한 데이터를 재사용한다.
 */
export default async function ProgramsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const home = getHomeContent(locale);
  const programViews = await getPublishedPrograms(locale);

  const cards = home.programs.items.flatMap((item) => {
    const view = programViews.find((program) => program.type === item.code);
    return view
      ? [{ item, view, facts: buildProgramCardFacts(view, home.programs.labels) }]
      : [];
  });
  const pages = getPageContent(locale, await getProgramNumbers());

  return (
    <>
      <PageHero
        intro={{
          eyebrow: home.programs.eyebrow,
          title: dict.pages.programs.title,
          description: home.programs.description,
        }}
      />

      <Section title={home.major.title}>
        <Prose paragraphs={home.major.paragraphs} />
        <p className="mt-6 max-w-3xl rounded-md border-l-2 border-gold bg-beige px-5 py-4 text-sm leading-relaxed text-navy">
          {home.major.ficbNote}
        </p>
      </Section>

      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map(({ item: program, view, facts }) => {
            const isDoctorate = program.code === "DBA";

            return (
              <article
                key={program.code}
                className={cn(
                  "flex flex-col rounded-xl border p-7 sm:p-9",
                  isDoctorate
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-background",
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "font-serif text-3xl font-bold tracking-wide",
                      isDoctorate ? "text-gold-soft" : "text-navy",
                    )}
                  >
                    {program.code}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isDoctorate ? "text-white/70" : "text-muted",
                    )}
                  >
                    {view.name}
                  </span>
                </div>

                <p
                  className={cn(
                    "mt-3",
                    isDoctorate ? "text-white/85" : "text-foreground/75",
                  )}
                >
                  {program.tagline}
                </p>

                <dl
                  className={cn(
                    "mt-7 grid grid-cols-2 gap-y-5 border-t pt-6 text-sm",
                    isDoctorate ? "border-white/15" : "border-line",
                  )}
                >
                  <div>
                    <dt
                      className={cn(
                        "text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {home.programs.labels.duration}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 font-semibold",
                        isDoctorate ? "text-white" : "text-navy",
                      )}
                    >
                      {facts.duration ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt
                      className={cn(
                        "text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {home.programs.labels.credits}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 font-semibold",
                        isDoctorate ? "text-white" : "text-navy",
                      )}
                    >
                      {facts.totalCredits ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dd
                      className={
                        isDoctorate ? "text-white/75" : "text-foreground/70"
                      }
                    >
                      {facts.breakdown}
                    </dd>
                    <dd
                      className={cn(
                        "mt-1 text-xs",
                        isDoctorate ? "text-white/55" : "text-muted",
                      )}
                    >
                      {facts.chapel}
                      {program.note ? ` · ${program.note}` : ""}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={program.href}
                  className={cn(
                    "mt-8 inline-flex w-fit items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors",
                    isDoctorate
                      ? "bg-white text-navy hover:bg-beige"
                      : "bg-navy text-white hover:bg-navy-soft",
                  )}
                >
                  {program.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </Section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/faculty", label: pages.related.faculty },
          { path: "/admission", label: pages.related.admission },
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
