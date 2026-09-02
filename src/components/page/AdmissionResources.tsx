import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/navigation";
import { formatAttachmentSize } from "@/lib/cms/news";
import type { AdmissionResourceItem } from "@/lib/cms/resources";

/**
 * 입학안내 페이지 하단의 "입학 관련 서류 다운로드" 영역. (A안 · 자료실 지시 16·17항)
 *
 * ## 온라인 입학신청과 혼동되지 않게 (지시 18·19항)
 *
 * 이 영역은 **지원자가 필요한 양식을 받는 보조 기능**이다. 온라인 입학신청(`/apply`)을
 * 대체하지 않으며, 입학안내 페이지의 지원 절차 안내와는 별도 섹션으로 둔다.
 *
 * 자료가 없으면(공개된 ADMISSION 카테고리 자료 0건) 이 컴포넌트를 렌더링하는 쪽에서
 * 아예 부르지 않는다. (`items.length === 0` 이면 `null`)
 *
 * 첨부가 1개면 바로 다운로드 버튼, 여러 개면 상세페이지로 보낸다.
 */
export function AdmissionResources({
  locale,
  items,
  labels,
}: {
  locale: Locale;
  items: AdmissionResourceItem[];
  labels: {
    sectionTitle: string;
    download: string;
    viewDetail: string;
    fileCount: string;
    viewAll: string;
    newWindow: string;
  };
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-line bg-surface py-14 lg:py-20">
      <div className="mx-auto w-full max-w-site px-5 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-navy">
          {labels.sectionTitle}
        </h2>

        <ul className="mt-8 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-line bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <span className="min-w-0 font-semibold break-words text-navy">
                {item.title}
              </span>

              {item.singleAttachment ? (
                <a
                  href={item.singleAttachment.downloadUrl}
                  download={item.singleAttachment.name}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-navy px-4 py-2 text-xs font-semibold whitespace-nowrap text-navy transition-colors hover:bg-navy hover:text-white sm:self-center"
                >
                  <span
                    aria-hidden="true"
                    className="rounded border border-current px-1 py-0.5 text-[0.5625rem] font-bold"
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
                  href={localePath(locale, `/resources/${item.slug}`)}
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-navy px-4 py-2 text-xs font-semibold whitespace-nowrap text-navy transition-colors hover:bg-navy hover:text-white sm:self-center"
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

        <div className="mt-6">
          <Link
            href={localePath(locale, "/resources")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            {labels.viewAll}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
