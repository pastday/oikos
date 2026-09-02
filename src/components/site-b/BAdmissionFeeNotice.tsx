import type { AdmissionContent } from "@/content/pages";
import { BSection } from "./BLayout";
import { BHeadline } from "./BType";

/**
 * 입학안내 페이지의 "입학허가비 안내" 영역. (B안)
 *
 * A안(`components/page/AdmissionFeeNotice`)과 **데이터·노출 범위는 같고 조판만 다르다.**
 * 은행·예금주·계좌번호는 전달되지 않는다. `enabled=false` 면 부모가 렌더링하지 않는다.
 */
export function BAdmissionFeeNotice({
  enabled,
  index,
  amountFormatted,
  content,
}: {
  enabled: boolean;
  /** 레일 번호. 입학안내 페이지의 다른 섹션들과 이어지는 값을 넘긴다. */
  index: number;
  amountFormatted: string;
  content: AdmissionContent["admissionFee"];
}) {
  if (!enabled) return null;

  return (
    <BSection index={index} label={content.title} tone="paper">
      <BHeadline>{content.title}</BHeadline>

      <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
        {content.steps.map((step, stepIndex) => (
          <li key={step} className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-ink">
              {step}
            </span>
            {stepIndex < content.steps.length - 1 && (
              <span aria-hidden="true" className="text-bronze">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-12 border-t border-rule pt-8">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
            {content.amountLabel}
          </span>
          <span className="font-serif text-3xl font-bold text-ink">
            {amountFormatted}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {content.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="max-w-[62ch] text-[0.9375rem] leading-[1.85] text-quiet"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <ul className="mt-6 space-y-2">
          {content.notes.map((note) => (
            <li key={note} className="flex gap-3 text-xs text-quiet">
              <span
                aria-hidden="true"
                className="mt-2 h-px w-3 shrink-0 bg-rule-2"
              />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </BSection>
  );
}
