import type { Locale } from "@/i18n/config";
import { BButton } from "./BBlocks";
import { BContainer } from "./BLayout";
import { BDisplay, BEyebrow, BLead } from "./BType";
import { bPath } from "./paths";

/**
 * 페이지 마지막의 입학상담 안내.
 *
 * ## 문구는 새로 만들지 않는다
 *
 * 제목·설명·버튼 글자는 전부 기존 콘텐츠에서 온다.
 * 눈에 띄게 하려고 "지금 바로", "놓치지 마세요" 같은 문구를 지어내지 않는다.
 * (CLAUDE.md 23항) **커지는 것은 크기와 여백뿐이다.**
 *
 * ## 구조
 *
 * 화면 전체를 어두운 면으로 덮고 위아래 여백을 아주 넓게 둔다.
 * 제목을 Hero 급 크기로 세워 페이지가 여기서 끝난다는 것을 분명히 한다.
 * A안은 같은 자리에 네이비 띠 하나에 제목과 버튼을 좌우로 배치한다.
 */
export function BConsultationCTA({
  locale,
  eyebrow,
  title,
  description,
  cta,
}: {
  locale: Locale;
  /** 이미 쓰고 있는 메뉴 이름을 그대로 받는다. 새 문구가 아니다. */
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <section className="relative overflow-hidden bg-midnight py-28 text-white lg:py-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_15%_0%,rgba(168,130,63,0.22),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:7rem_7rem] opacity-[0.05]"
      />

      <BContainer className="relative">
        <BEyebrow tone="dark">{eyebrow}</BEyebrow>

        <BDisplay tone="dark" className="mt-10 max-w-[18ch]">
          {title}
        </BDisplay>

        <BLead tone="dark" className="mt-10 max-w-2xl">
          {description}
        </BLead>

        <div className="mt-14">
          <BButton href={bPath(locale, "/consultation")} tone="bronze">
            {cta}
          </BButton>
        </div>
      </BContainer>
    </section>
  );
}
