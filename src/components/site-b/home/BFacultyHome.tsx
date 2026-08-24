import type { HomeContent } from "@/content/home";
import type { FacultyContent } from "@/content/pages";
import type { Locale } from "@/i18n/config";
import type { FacultyView } from "@/lib/cms/types";
import { BTextLink } from "@/components/site-b/BBlocks";
import { BFacultyFeature } from "@/components/site-b/BFacultyFeature";
import Image from "next/image";
import { designBImages } from "@/components/site-b/images";
import { BSection } from "@/components/site-b/BLayout";
import { BHeadline, BLead } from "@/components/site-b/BType";
import { bPath } from "@/components/site-b/paths";

/**
 * 메인의 교수진 소개.
 *
 * ## 이전 시안과 무엇이 다른가
 *
 * 이전에는 이니셜 판과 이름을 좌우로 붙인 한 덩어리였고, 사진이 없다는 사실이
 * 그대로 드러났다. 지금은 **세로로 긴 인물 사진 자리를 먼저 만들어 두고**
 * 그 안을 디자인된 면으로 채운다. 자료가 하나뿐이어도 지면이 허전하지 않다.
 *
 * 카드는 교수진 페이지와 **같은 컴포넌트**를 쓴다. 두 화면에서 교수가
 * 다르게 보이지 않게 하려는 것이다.
 *
 * 공개된 주임교수가 없으면 섹션 자체를 그리지 않는다. (A안과 같은 규칙)
 */
export function BFacultyHome({
  locale,
  content,
  facultyLabels,
  chief,
  watermark,
}: {
  locale: Locale;
  content: HomeContent;
  facultyLabels: FacultyContent["labels"];
  chief: FacultyView | null;
  watermark: string;
}) {
  const { faculty } = content;

  if (!chief) return null;

  return (
    <BSection index={5} label={faculty.eyebrow} tone="stone" className="relative isolate">
      {/* 배경에 아주 옅게 깔리는 건축 사진. 지면이 단색으로 비어 보이지 않게 한다.
          **사람 사진은 쓰지 않는다.** 모르는 사람이 교수처럼 보이면 안 된다. */}
      <Image
        src={designBImages.heroCampus}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover opacity-[0.07]"
      />

      <div className="relative max-w-3xl">
        <BHeadline>{faculty.title}</BHeadline>
        <BLead className="mt-6">{faculty.description}</BLead>
      </div>

      <div className="mt-14">
        {/* 메인은 소개까지만 보여주고 나머지는 교수진 페이지로 보낸다. */}
        <BFacultyFeature
          member={chief}
          labels={facultyLabels}
          watermark={watermark}
          size="feature"
          detail="brief"
        />
      </div>

      <div className="mt-12">
        <BTextLink href={bPath(locale, "/faculty")}>{faculty.cta}</BTextLink>
      </div>
    </BSection>
  );
}
