import { Section } from "@/components/page/Section";
import type { AdmissionContent } from "@/content/pages";

/**
 * 입학안내 페이지의 "입학허가비 안내" 영역. (A안 · 입학허가비 안내 지시 7·8·20항)
 *
 * ## 무엇을 보여 주는가
 *
 * - 절차 6단계 (입학상담 → … → 등록금 납부)
 * - 입학허가비 **금액만** (`amountFormatted` — `SiteSetting` 값을 `formatKrw` 로 포맷)
 * - 설명 문단
 * - ※ 등록금과 별도 / ※ 계좌는 최종 제출 후 안내
 *
 * ## 무엇을 보여 주지 않는가
 *
 * **은행·예금주·계좌번호는 이 컴포넌트에 전달되지도 않는다.** 공개 입학안내 HTML 에
 * 개인 명의 계좌번호가 들어가지 않도록 애초에 `getAdmissionFeeDisplay()` 가 금액만 담는다.
 *
 * 서버 컴포넌트다. 상호작용이 없어 클라이언트 번들로 아무것도 나가지 않는다.
 * 관리자가 납부 안내를 끄면(`enabled=false`) 부모가 이 컴포넌트를 렌더링하지 않는다.
 */
export function AdmissionFeeNotice({
  enabled,
  amountFormatted,
  content,
}: {
  enabled: boolean;
  amountFormatted: string;
  content: AdmissionContent["admissionFee"];
}) {
  if (!enabled) return null;

  return (
    <Section title={content.title} tone="surface">
      {/* 절차: 6단계를 화살표로 잇는다. 좁은 화면에서는 세로로 쌓인다. */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
        {content.steps.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-md border border-navy/20 bg-navy-tint px-3 py-1.5 font-semibold text-navy">
              {step}
            </span>
            {index < content.steps.length - 1 && (
              <span aria-hidden="true" className="text-muted">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-navy/15 bg-background px-6 py-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-4">
          <span className="text-xs font-semibold text-muted">
            {content.amountLabel}
          </span>
          <span className="font-serif text-2xl font-bold text-navy">
            {amountFormatted}
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {content.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-sm leading-relaxed text-foreground/80"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <ul className="mt-4 space-y-1.5">
          {content.notes.map((note) => (
            <li key={note} className="flex gap-2 text-xs text-muted">
              <span aria-hidden="true">※</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
