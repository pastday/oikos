import type { FacultyContent } from "@/content/pages";
import type { FacultyView } from "@/lib/cms/types";
import { BFrame } from "./BFrame";
import { BRule } from "./BType";

/**
 * 교수 한 명을 보여주는 판.
 *
 * 메인의 주임교수 소개와 교수진 페이지가 **같은 것**을 쓴다.
 * 두 화면에서 교수가 다르게 보이지 않게 하려는 것이다.
 *
 * ## 사진이 없을 때
 *
 * A안은 지름 96px 짜리 이니셜 원을 그린다. 자료가 없다는 인상이 그대로 남는다.
 * B안은 **세로로 긴 인물 사진 자리(4:5)를 먼저 만들어 두고** 그 안을
 * `BFrame` 이 만든 면으로 채운 뒤, 이니셜을 큰 글자로 얹는다.
 * 사진이 들어오면 이니셜만 사라지고 배치는 그대로다.
 *
 * 실존하지 않는 인물 사진을 만들거나 인터넷 사진을 가져오지 않는다.
 */
export function BFacultyFeature({
  member,
  labels,
  watermark,
  size = "normal",
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
  watermark: string;
  /** `feature` 는 메인처럼 한 명만 크게 보여줄 때 쓴다. */
  size?: "normal" | "feature";
}) {
  const details = [
    { label: labels.major, value: member.major },
    { label: labels.career, value: member.career },
    { label: labels.lectureFields, value: member.lectureFields },
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail.value),
  );

  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className={size === "feature" ? "lg:col-span-5" : "lg:col-span-4"}>
        <div className="relative">
          <BFrame
            media={member.photo}
            watermark={watermark}
            ratio="4/5"
            sizes="(min-width: 1024px) 26rem, 100vw"
          />

          {/* 사진이 없을 때만 이니셜을 얹는다. 사진이 들어오면 사라진다. */}
          {!member.photo && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-7xl font-bold tracking-[0.08em] text-white/85"
            >
              {member.initials}
            </span>
          )}
        </div>
      </div>

      <div
        className={
          size === "feature"
            ? "flex flex-col justify-center lg:col-span-7"
            : "lg:col-span-8"
        }
      >
        <h3
          className={
            size === "feature"
              ? "font-serif text-display font-bold text-ink"
              : "font-serif text-headline font-bold text-ink"
          }
        >
          {member.name}
        </h3>

        {member.nameAlt && (
          <p className="mt-4 text-sm tracking-[0.14em] text-quiet uppercase">
            {member.nameAlt}
          </p>
        )}

        {member.title && (
          <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.22em] text-bronze uppercase">
            {member.title}
          </p>
        )}

        {details.length > 0 && (
          <dl className="mt-10">
            <BRule />
            {details.map((detail) => (
              <div key={detail.label}>
                <div className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
                    {detail.label}
                  </dt>
                  {/* 관리자가 입력한 글이다. HTML 로 렌더링하지 않고 줄바꿈만 살린다. */}
                  <dd className="max-w-[62ch] text-[0.9375rem] leading-[1.9] whitespace-pre-line text-ink/80">
                    {detail.value}
                  </dd>
                </div>
                <BRule />
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
