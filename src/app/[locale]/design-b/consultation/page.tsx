import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConsultationForm } from "@/app/[locale]/(site)/consultation/ConsultationForm";
import { BRowList, BTextLink, type BRow } from "@/components/site-b/BBlocks";
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

  const content = getPageContent(locale, await getProgramNumbers()).consultation;

  return buildDesignBMetadata({
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * B안 입학상담 신청.
 *
 * ## 폼 자체는 복제하지 않는다
 *
 * `ConsultationForm` 은 **A안이 쓰는 것과 같은 컴포넌트**다.
 * 따라서 Server Action · zod 검증 · 오류 코드 · 중복 제출 차단 · 스팸 방어가
 * 전부 그대로 동작한다. 디자인 때문에 이 코드를 한 벌 더 만들면 두 벌이 갈라지고
 * 보안 수준이 낮아진다.
 *
 * 대신 **페이지 구성은 B안 전용**이다.
 *  - A안: 안내 카드 3개 → 폼 → 설명회 링크 상자를 세로로 쌓는다.
 *  - B안: 왼쪽에 안내가 머물고 오른쪽에 폼이 서는 2단 배치다.
 *
 * 폼 안의 색은 `form-b` 껍데기가 CSS 변수만 바꿔 끼운다. (globals.css)
 * `basePath` 로 제출 성공 후 안내 링크가 B안 안에 머문다.
 */
export default async function DesignBConsultationPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.consultation;

  const guideRows: BRow[] = content.guide.items.map((item) => ({
    id: item.title,
    title: item.title,
    body: item.description,
  }));

  return (
    <>
      <BPageHero
        intro={content.intro}
        index={9}
        watermark={dict.site.wordmark}
      />

      <BSection index={1} label={content.form.title} tone="paper">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* 왼쪽: 무엇을 상담할 수 있는지 */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <BHeadline>{content.guide.title}</BHeadline>
              <BLead className="mt-6">{content.guide.description}</BLead>

              <div className="mt-10">
                <BRowList rows={guideRows} />
              </div>

              {/* 대표 전화·카카오톡 채널이 확정되지 않아 버튼을 만들지 않고 안내만 둔다. */}
              <div className="mt-10">
                <BNotice title={content.channelNotice.title}>
                  {content.channelNotice.body}
                </BNotice>
              </div>
            </div>
          </div>

          {/* 오른쪽: 신청 폼 */}
          <div className="lg:col-span-7">
            <BEyebrow>{content.form.title}</BEyebrow>
            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-[1.85] text-quiet">
              {content.form.description}
            </p>

            <div className="form-b mt-10 border-t border-rule pt-10">
              <ConsultationForm
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
              <BEyebrow>{content.seminarLink.title}</BEyebrow>
              <p className="mt-4 font-serif text-xl leading-snug font-bold text-ink sm:text-2xl">
                {content.seminarLink.description}
              </p>
            </div>

            <BTextLink href={bPath(locale, "/consultation/seminar")}>
              {content.seminarLink.cta}
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
            path: "/consultation/seminar",
            label: pages.related.seminar,
            primary: true,
          },
        ]}
      />
    </>
  );
}
