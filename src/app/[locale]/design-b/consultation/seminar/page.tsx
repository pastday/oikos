import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeminarForm } from "@/app/[locale]/(site)/consultation/seminar/SeminarForm";
import { BTextLink } from "@/components/site-b/BBlocks";
import { BContainer, BSection } from "@/components/site-b/BLayout";
import { BPageHero } from "@/components/site-b/BPageHero";
import { BRelated } from "@/components/site-b/BRelated";
import {
  BEyebrow,
  BHeadline,
  BLead,
  BNotice,
} from "@/components/site-b/BType";
import { buildDesignBMetadata } from "@/components/site-b/metadata";
import { bPath, DESIGN_B_SEGMENT } from "@/components/site-b/paths";
import { getPageContent } from "@/content/pages";
import { getDictionary } from "@/i18n";
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
 * 검증·저장·중복 차단이 모두 같은 Server Action 을 지난다.
 * 페이지 구성만 B안 전용 2단 배치다.
 */
export default async function DesignBSeminarPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.seminar;

  return (
    <>
      <BPageHero
        intro={content.intro}
        index={10}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={content.form.title} tone="paper">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <BHeadline>{content.form.title}</BHeadline>
              <BLead className="mt-6">{content.form.description}</BLead>

              {/* 확정된 설명회 일정이 없으므로 날짜를 만들어 제시하지 않는다. */}
              <div className="mt-10">
                <BNotice title={content.scheduleNotice.title}>
                  {content.scheduleNotice.body}
                </BNotice>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="form-b border-t border-rule pt-10">
              <SeminarForm
                locale={locale}
                content={content.form}
                basePath={`/${DESIGN_B_SEGMENT}`}
              />
            </div>
          </div>
        </div>
      </BSection>

      <section className="border-t border-rule bg-stone py-14 lg:py-16">
        <BContainer>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <BEyebrow>{content.consultationLink.title}</BEyebrow>
              <p className="mt-4 font-serif text-xl leading-snug font-bold text-ink sm:text-2xl">
                {content.consultationLink.description}
              </p>
            </div>

            <BTextLink href={bPath(locale, "/consultation")}>
              {content.consultationLink.cta}
            </BTextLink>
          </div>
        </BContainer>
      </section>

      <BRelated
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
