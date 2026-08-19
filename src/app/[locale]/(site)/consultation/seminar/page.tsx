import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PendingNotice } from "@/components/form/FormFeedback";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/page/PageHero";
import { RelatedLinks } from "@/components/page/RelatedLinks";
import { Section } from "@/components/page/Section";
import { getPageContent } from "@/content/pages";
import { getProgramNumbers } from "@/lib/cms/queries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { SeminarForm } from "./SeminarForm";

/** 입학상담 하위 경로로 둔다. 한국어·영어가 같은 구조를 쓴다. */
const PAGE_PATH = "/consultation/seminar";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).seminar;

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function SeminarPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.seminar;

  return (
    <>
      <PageHero intro={content.intro} />

      <Section
        title={content.form.title}
        description={content.form.description}
      >
        {/* 확정된 설명회 일정이 없으므로 날짜를 만들어 제시하지 않는다. */}
        <div className="mb-8 max-w-3xl">
          <PendingNotice title={content.scheduleNotice.title}>
            {content.scheduleNotice.body}
          </PendingNotice>
        </div>

        <div className="max-w-3xl">
          <SeminarForm locale={locale} content={content.form} />
        </div>
      </Section>

      <section className="border-b border-line bg-surface py-12 lg:py-14">
        <Container>
          <div className="flex flex-col gap-5 rounded-lg border border-line bg-background px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-lg font-bold text-navy">
                {content.consultationLink.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {content.consultationLink.description}
              </p>
            </div>

            <Link
              href={localePath(locale, "/consultation")}
              className="inline-flex shrink-0 justify-center rounded-md border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {content.consultationLink.cta}
            </Link>
          </div>
        </Container>
      </section>

      <RelatedLinks
        locale={locale}
        title={pages.related.title}
        links={[
          { path: "/admission", label: pages.related.admission },
          { path: "/programs", label: pages.related.programs },
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
