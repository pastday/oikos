import type { ReactNode } from "react";
import { DeleteButton } from "./DeleteButton";
import type {
  CourseCategory,
  FacultyType,
  NewsCategory,
  ProgramType,
  ResourceCategory,
} from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";

/**
 * CMS 목록 화면이 함께 쓰는 작은 조각들.
 * 8단계 상담관리에서 만든 `ui.tsx` 와 같은 성격이며, CMS 에만 필요한 것만 여기 둔다.
 */

export const facultyTypeLabels: Record<FacultyType, string> = {
  CHIEF_PROFESSOR: "주임교수",
  PROFESSOR: "교수",
  VISITING_PROFESSOR: "객원교수",
};

export const courseCategoryLabels: Record<CourseCategory, string> = {
  MAJOR: "전공",
  COMMON: "공통",
  CHAPEL: "채플",
  OTHER: "기타",
};

export const programTypeLabels: Record<ProgramType, string> = {
  MBA: "MBA",
  DBA: "DBA",
};

/** 학교소식 카테고리. 관리자 화면은 한국어만 쓴다. (공개 화면 라벨은 `lib/cms/news.ts`) */
export const newsCategoryLabels: Record<NewsCategory, string> = {
  NOTICE: "공지",
  EVENT: "행사",
  ACADEMIC: "학사",
  MEDIA: "미디어",
  OTHER: "기타",
};

/** 자료실 카테고리. 관리자 화면은 한국어만 쓴다. (공개 화면 라벨은 `lib/cms/resources.ts`) */
export const resourceCategoryLabels: Record<ResourceCategory, string> = {
  ADMISSION: "입학 관련 서식",
  GUIDE: "모집요강",
  ACADEMIC: "학사 자료",
  OTHER: "기타 자료",
};

/** 학기가 지정되지 않은 과목을 목록에서 어떻게 부를지. */
export const SEMESTER_UNSET_LABEL = "학기 미지정";

/** 학점이 입력되지 않은 과목. 원본에 표기가 없는 경우다. */
export const CREDITS_UNSET_LABEL = "미입력";

// ---------------------------------------------------------------------------

/** 공개 여부. 색만으로 구분하지 않고 문구를 함께 둔다. */
export function PublishBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        isPublished
          ? "border-navy/25 bg-navy-tint text-navy"
          : "border-line bg-surface text-muted",
      )}
    >
      {isPublished ? "공개" : "비공개"}
    </span>
  );
}

// ---------------------------------------------------------------------------

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-muted"
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 align-top", className)}>{children}</td>
  );
}

// ---------------------------------------------------------------------------

/**
 * 삭제 버튼.
 *
 * 실수로 지우는 것을 막기 위해 브라우저 확인창을 거친다.
 * 실제 삭제 권한 확인은 서버 액션에서 다시 한다. 이 확인창은 편의 장치일 뿐이다.
 */
export function DeleteForm({
  action,
  id,
  confirmMessage,
  label = "삭제",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} readOnly />
      <DeleteButton confirmMessage={confirmMessage} label={label} />
    </form>
  );
}
