import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { BContainer } from "./BLayout";
import { BEyebrow } from "./BType";
import { bPath } from "./paths";

export type BRelatedLink = {
  /** locale 과 design-b 를 제외한 경로 */
  path: string;
  label: string;
  primary?: boolean;
};

/**
 * 페이지 하단에서 다음 페이지로 넘어가는 자리.
 *
 * A안은 네이비 띠 안에 알약 모양 버튼을 늘어놓는다.
 * B안은 **번호가 붙은 가로선 목록**이라 본문의 다른 목록과 같은 어휘를 쓴다.
 * 항목을 크게 두어 "다음에 볼 것"이 분명해진다.
 *
 * 링크 목록과 문구는 A안과 같고 **경로만 B안**이다. (B안을 벗어나지 않는다)
 */
export function BRelated({
  locale,
  title,
  links,
}: {
  locale: Locale;
  title: string;
  links: BRelatedLink[];
}) {
  return (
    <section className="border-t border-rule bg-stone py-16 lg:py-20">
      <BContainer>
        <BEyebrow>{title}</BEyebrow>

        <ul className="mt-8 border-t border-rule-2/60">
          {links.map((link, index) => (
            <li key={link.path} className="border-b border-rule-2/60">
              <Link
                href={bPath(locale, link.path)}
                className="group flex items-center gap-6 py-6 transition-colors hover:bg-paper-2 sm:gap-10"
              >
                <span
                  aria-hidden="true"
                  className="font-serif text-xs font-bold tabular-nums text-bronze"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={cn(
                    "flex-1 font-serif text-xl font-bold sm:text-2xl",
                    link.primary ? "text-bronze" : "text-ink",
                  )}
                >
                  {link.label}
                </span>

                <span
                  aria-hidden="true"
                  className="text-ink transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </BContainer>
    </section>
  );
}
