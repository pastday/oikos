import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeminarForm } from "@/app/[locale]/(site)/consultation/seminar/SeminarForm";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { PageHeroB } from "@/components/site-b/PageHeroB";
import { bPath, DESIGN_B_SEGMENT } from "@/components/site-b/paths";
import { RelatedLinksB } from "@/components/site-b/RelatedLinksB";
import {
  ButtonB,
  NoticeB,
  SectionB,
  SectionHeadB,
} from "@/components/site-b/SectionB";
import { getPageContent } from "@/content/pages";
import { isLocale } from "@/i18n/config";
import { getProgramNumbers } from "@/lib/cms/queries";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPageContent(locale, await getProgramNumbers()).seminar;

  return buildDesignBMetadata({
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * B안 설명회 신청.
 *
 * 입학상담과 마찬가지로 **폼은 A안과 같은 컴포넌트**를 그대로 쓴다.
 * 검증·저장·중복 차단이 모두 같은 Server Action 을 지난다. (13단계 지시 23·27항)
 */
export default async function DesignBSeminarPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.seminar;

  return (
    <>
      <PageHeroB intro={content.intro} />

      <SectionB>
        <SectionHeadB
          index={1}
          title={content.form.title}
          description={content.form.description}
        />

        {/* 확정된 설명회 일정이 없으므로 날짜를 만들어 제시하지 않는다. */}
        <div className="mt-12">
          <NoticeB title={content.scheduleNotice.title}>
            {content.scheduleNotice.body}
          </NoticeB>
        </div>

        <div className="form-b mt-12 max-w-3xl border border-rule bg-paper px-6 py-10 sm:px-10 lg:px-12">
          <SeminarForm
            locale={locale}
            content={content.form}
            basePath={`/${DESIGN_B_SEGMENT}`}
          />
        </div>
      </SectionB>

      <SectionB tone="paper-2" size="compact">
        <div className="flex flex-col gap-8 border border-rule bg-paper px-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {content.consultationLink.title}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-quiet">
              {content.consultationLink.description}
            </p>
          </div>

          <ButtonB href={bPath(locale, "/consultation")} variant="outline">
            {content.consultationLink.cta}
          </ButtonB>
        </div>
      </SectionB>

      <RelatedLinksB
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
