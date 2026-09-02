import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatAttachmentSize } from "@/lib/cms/news";
import type { AdmissionResourceItem } from "@/lib/cms/resources";
import { BSection } from "./BLayout";
import { BHeadline } from "./BType";
import { bPath } from "./paths";

/**
 * 입학안내 페이지 하단의 "입학 관련 서류 다운로드" 영역. (B안)
 *
 * A안(`components/page/AdmissionResources`)과 **데이터는 같고 조판만 다르다.**
 * 자료가 없으면 렌더링하는 쪽에서 부르지 않는다.
 */
export function BAdmissionResources({
  locale,
  index,
  items,
  labels,
}: {
  locale: Locale;
  /** 레일 번호. 입학안내 페이지의 다른 섹션들과 이어지는 값을 넘긴다. */
  index: number;
  items: AdmissionResourceItem[];
  labels: {
    sectionTitle: string;
    download: string;
    viewDetail: string;
    fileCount: string;
    viewAll: string;
  };
}) {
  if (items.length === 0) return null;

  return (
    <BSection index={index} label={labels.sectionTitle} tone="stone">
      <BHeadline>{labels.sectionTitle}</BHeadline>

      <ul className="mt-12 border-t border-rule-2/60">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-baseline justify-between gap-4 border-b border-rule-2/60 py-6"
          >
            <span className="min-w-0 flex-1 font-serif text-lg font-bold break-words text-ink">
              {item.title}
            </span>

            {item.singleAttachment ? (
              <a
                href={item.singleAttachment.downloadUrl}
                download={item.singleAttachment.name}
                className="group inline-flex shrink-0 items-baseline gap-2 text-xs font-semibold tracking-[0.08em] text-ink hover:underline"
              >
                <span
                  aria-hidden="true"
                  className="text-[0.625rem] font-bold tracking-[0.2em] text-bronze"
                >
                  {item.singleAttachment.ext}
                </span>
                {labels.download}
                <span aria-hidden="true">
                  ↓ ({formatAttachmentSize(item.singleAttachment.size)})
                </span>
              </a>
            ) : (
              <Link
                href={bPath(locale, `/resources/${item.slug}`)}
                className="inline-flex shrink-0 items-baseline gap-2 text-xs font-semibold tracking-[0.08em] text-ink hover:underline"
              >
                {item.attachmentCount > 0
                  ? labels.fileCount.replace(
                      "{count}",
                      String(item.attachmentCount),
                    )
                  : labels.viewDetail}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={bPath(locale, "/resources")}
          className="inline-flex items-center gap-2 font-serif text-lg font-bold text-ink hover:underline"
        >
          {labels.viewAll}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </BSection>
  );
}
