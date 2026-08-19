import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConsultationForm } from "@/app/[locale]/(site)/consultation/ConsultationForm";
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

  const content = getPageContent(locale, await getProgramNumbers()).consultation;

  return buildDesignBMetadata({
    title: content.intro.title,
    description: content.intro.description,
  });
}

/**
 * B안 입학상담 신청.
 *
 * ## 폼은 복제하지 않는다
 *
 * `ConsultationForm` 은 **A안이 쓰는 것과 같은 컴포넌트**다.
 * 따라서 Server Action · zod 검증 · 오류 코드 · 중복 제출 차단 · 스팸 방어가
 * 전부 그대로 동작한다. 디자인 때문에 이 코드를 한 벌 더 만들면 두 벌이 갈라지고
 * 보안 수준이 낮아진다. (13단계 지시 23·27항)
 *
 * 대신 두 가지만 바꾼다.
 *  - `form-b` 껍데기가 폼 안의 색 토큰을 B안 값으로 바꿔 끼운다. (globals.css)
 *  - `basePath` 로 제출 성공 후 안내 링크가 B안 안에 머물게 한다.
 */
export default async function DesignBConsultationPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const pages = getPageContent(locale, await getProgramNumbers());
  const content = pages.consultation;

  return (
    <>
      <PageHeroB intro={content.intro} />

      <SectionB>
        <SectionHeadB
          index={1}
          title={content.guide.title}
          description={content.guide.description}
        />

        <ul className="mt-14 grid gap-px bg-rule lg:grid-cols-3">
          {content.guide.items.map((item, index) => (
            <li key={item.title} className="bg-paper px-7 py-10">
              <span className="font-serif text-sm font-bold tracking-[0.1em] text-bronze">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-serif text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-[1.9] text-quiet">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        {/* 대표 전화·카카오톡 채널이 확정되지 않아 버튼을 만들지 않고 안내만 둔다. */}
        <div className="mt-10">
          <NoticeB title={content.channelNotice.title}>
            {content.channelNotice.body}
          </NoticeB>
        </div>
      </SectionB>

      <SectionB tone="paper-2">
        <SectionHeadB
          index={2}
          title={content.form.title}
          description={content.form.description}
        />

        <div className="form-b mt-14 max-w-3xl border border-rule bg-paper px-6 py-10 sm:px-10 lg:px-12">
          <ConsultationForm
            locale={locale}
            content={content.form}
            basePath={`/${DESIGN_B_SEGMENT}`}
          />
        </div>
      </SectionB>

      <SectionB size="compact">
        <div className="flex flex-col gap-8 border border-rule bg-paper-2 px-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {content.seminarLink.title}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-quiet">
              {content.seminarLink.description}
            </p>
          </div>

          <ButtonB
            href={bPath(locale, "/consultation/seminar")}
            variant="outline"
          >
            {content.seminarLink.cta}
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
            path: "/consultation/seminar",
            label: pages.related.seminar,
            primary: true,
          },
        ]}
      />
    </>
  );
}
