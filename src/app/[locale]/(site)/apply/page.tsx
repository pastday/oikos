import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { getAdmissionContent } from "@/content/admission";
import { isLocale } from "@/i18n/config";
import { admissionYearRange } from "@/lib/admission/form-config";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/lib/navigation";
import { ApplyForm } from "./ApplyForm";

/**
 * 온라인 입학신청 페이지. (18단계)
 *
 * ## 왜 `(site)` 안에 두는가
 *
 * 기존 입학안내(`/[locale]/admission`)와 같은 Header/Footer 를 쓰고,
 * 상담 페이지와 자연스럽게 오갈 수 있어야 한다. 새 route group 을 만들면
 * 껍데기를 한 벌 더 관리해야 하므로 만들지 않는다.
 *
 * B안(`design-b`)에는 복제하지 않는다. 검증·암호화·파일 저장이 걸린 폼을
 * 디자인 때문에 두 벌로 나누면 두 벌이 갈라진다. (13단계에서 상담 폼에 대해 내린 판단과 같다)
 *
 * ## 캐시
 *
 * 이 페이지는 DB 를 읽지 않지만 **입학 연도 목록이 시간에 따라 달라진다.**
 * 완전 정적으로 두면 해가 바뀌어도 예전 연도만 보인다. 하루마다 다시 만든다.
 */

const PAGE_PATH = "/apply";

/** 하루. 입학 연도 목록이 해가 바뀌면 따라가도록 한다. */
export const revalidate = 86400;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getAdmissionContent(locale);

  return buildPageMetadata({
    locale,
    path: PAGE_PATH,
    title: content.intro.title,
    description: content.intro.description,
  });
}

export default async function ApplyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getAdmissionContent(locale);

  const { min, max } = admissionYearRange();
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <>
      <PageHero intro={content.intro} />

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {/* 학사학위가 없는 지원자를 상담으로 보낸다. 폼 안에서 자격을 판단하지 않는다. (지시 27항) */}
          <div className="rounded-lg border border-line bg-surface px-6 py-5">
            <h2 className="text-sm font-semibold text-navy">
              {content.eligibility.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {content.eligibility.body}
            </p>
            <Link
              href={localePath(locale, "/consultation")}
              className="mt-4 inline-flex rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {content.eligibility.cta}
            </Link>
          </div>

          {/* 임시저장이 없다는 사실을 폼 시작 전에 분명히 알린다. (지시 20항) */}
          <p
            role="note"
            className="rounded-md border border-gold/40 bg-beige px-5 py-4 text-sm leading-relaxed text-[#7a5c2b]"
          >
            {content.notices.noDraft}
          </p>
        </div>
      </Section>

      <Section tone="surface">
        <div className="mx-auto max-w-3xl">
          <ApplyForm locale={locale} years={years} />
        </div>
      </Section>
    </>
  );
}
