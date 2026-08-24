import type { ReactNode } from "react";
import type { FacultyContent } from "@/content/pages";
import { hasFacultyProfile, type FacultyView } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
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
 *
 * ## 상세 프로필 (14단계)
 *
 * 소개·학력·경력·전문분야를 **작은 카드 여럿으로 쪼개지 않는다.** 라벨을 왼쪽에
 * 작은 대문자로 세우고 내용을 오른쪽에 흘린 뒤 얇은 선으로만 나눈다.
 * 경력이 20줄이 넘어가도 세로로 이어질 뿐 배치가 무너지지 않는다.
 *
 * 메인에서는 `detail="brief"` 로 **소개까지만** 보여준다. 메인은 교수진 페이지로
 * 보내는 자리이고, 학력·경력까지 그대로 옮기면 두 화면이 같은 것이 되어
 * "교수진 보기" 링크가 무의미해진다. 데이터는 같고 보여 주는 범위만 다르다.
 */
export function BFacultyFeature({
  member,
  labels,
  watermark,
  size = "normal",
  detail = "full",
}: {
  member: FacultyView;
  labels: FacultyContent["labels"];
  watermark: string;
  /** `feature` 는 메인처럼 한 명만 크게 보여줄 때 쓴다. */
  size?: "normal" | "feature";
  /** `brief` 는 소개만 그린다. 메인 Preview 용. */
  detail?: "full" | "brief";
}) {
  const showAll = detail === "full";
  const hasProfile = showAll
    ? hasFacultyProfile(member)
    : member.bio.length > 0;

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
        className={cn(
          "min-w-0",
          size === "feature"
            ? "flex flex-col justify-center lg:col-span-7"
            : "lg:col-span-8",
        )}
      >
        <h3
          className={cn(
            "font-serif font-bold break-words text-ink",
            size === "feature" ? "text-display" : "text-headline",
          )}
        >
          {member.name}
        </h3>

        {member.nameAlt && (
          <p className="mt-4 text-sm tracking-[0.14em] break-words text-quiet uppercase">
            {member.nameAlt}
          </p>
        )}

        {member.title && (
          <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.22em] text-bronze uppercase">
            {member.title}
          </p>
        )}

        {member.major && (
          <p className="mt-3 text-[0.9375rem] break-words text-ink/70">
            {member.major}
          </p>
        )}

        {hasProfile && (
          <dl className="mt-10">
            <BRule />

            {member.bio.length > 0 && (
              <BProfileRow label={labels.bio}>
                <div className="space-y-4">
                  {member.bio.map((paragraph, index) => (
                    <p key={index} className="break-words">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </BProfileRow>
            )}

            {showAll && member.education.length > 0 && (
              <BProfileRow label={labels.education}>
                <BProfileList items={member.education} />
              </BProfileRow>
            )}

            {showAll && member.career.length > 0 && (
              <BProfileRow label={labels.career}>
                <BProfileList items={member.career} />
              </BProfileRow>
            )}

            {showAll && member.lectureFields.length > 0 && (
              <BProfileRow label={labels.lectureFields}>
                <BExpertise items={member.lectureFields} />
              </BProfileRow>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}

/** 라벨 한 줄 + 내용. 아래에 얇은 선을 그어 다음 항목과 나눈다. */
function BProfileRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
        <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-quiet uppercase">
          {label}
        </dt>
        {/* 관리자가 입력한 글이다. HTML 로 렌더링하지 않는다. */}
        <dd className="max-w-[62ch] min-w-0 text-[0.9375rem] leading-[1.9] text-ink/80">
          {children}
        </dd>
      </div>
      <BRule />
    </div>
  );
}

/** 줄 단위 항목을 목록으로. 글머리표는 화면이 그린다. */
function BProfileList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.85em] h-px w-3 shrink-0 bg-rule-2"
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * 전문분야.
 *
 * 항목이 전부 짧으면 낱말 형태로 늘어놓는 편이 B안 지면에 어울린다.
 * 다만 관리자가 문장을 적어 넣을 수도 있으므로, **하나라도 길면 목록으로 되돌린다.**
 * 긴 글을 알약 모양 안에 넣으면 여러 줄로 접혀 모양이 무너진다.
 */
const EXPERTISE_CHIP_MAX = 30;

function BExpertise({ items }: { items: string[] }) {
  const fitsChips = items.every((item) => item.length <= EXPERTISE_CHIP_MAX);
  if (!fitsChips) return <BProfileList items={items} />;

  return (
    <ul className="flex flex-wrap gap-x-2.5 gap-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="max-w-full rounded-full border border-rule-2 px-3.5 py-1 text-[0.8125rem] break-words text-ink/75"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
