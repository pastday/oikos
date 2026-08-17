"use server";

import { redirect } from "next/navigation";
import type { ProgramType } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  revalidateCourse,
  revalidateFaculty,
  revalidateProgram,
} from "@/lib/cms/revalidate";
import {
  courseSchema,
  facultySchema,
  formDataToObject,
  programSchema,
  CMS_GENERIC_ERROR,
  CMS_INVALID_ERROR,
  CMS_NOT_FOUND_ERROR,
  type CmsFormState,
} from "@/lib/cms/validation";

/**
 * 교수진 · 과정 · 교과목 CMS 의 저장/삭제.
 *
 * **모든 액션이 시작할 때 `requireAdmin()` 을 호출한다.**
 * 서버 액션은 layout 을 거치지 않고 직접 호출될 수 있으므로 layout 인증을 믿지 않는다.
 *
 * 클라이언트가 보낸 필드를 그대로 Prisma 에 펼쳐 넣지 않는다.
 * zod 를 통과한 값만 명시적으로 매핑한다. (allowlist)
 */

/** Prisma 오류를 사용자용 문구로 바꾼다. 원문·stack trace 는 화면으로 내보내지 않는다. */
function toErrorState(scope: string, error: unknown): CmsFormState {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "P2025") {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  console.error(`[admin][cms][${scope}] 저장 실패`, error);
  return { status: "error", message: CMS_GENERIC_ERROR };
}

// ---------------------------------------------------------------------------
// 교수진
// ---------------------------------------------------------------------------

export async function saveFaculty(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = facultySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  try {
    if (id) {
      await prisma.faculty.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.faculty.create({ data: parsed.data });
    }
  } catch (error) {
    return toErrorState("faculty", error);
  }

  revalidateFaculty();

  // 새로 만든 경우에는 목록으로 보낸다. 같은 폼에 계속 머무르면 중복 생성하기 쉽다.
  if (!id) redirect("/admin/faculty");

  return { status: "saved" };
}

export async function deleteFaculty(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  try {
    await prisma.faculty.delete({ where: { id } });
  } catch (error) {
    // 이미 지워졌거나 없는 id 여도 목록으로 돌아가면 된다.
    console.error("[admin][cms][faculty] 삭제 실패", error);
    return;
  }

  revalidateFaculty();
  redirect("/admin/faculty");
}

// ---------------------------------------------------------------------------
// 과정
// ---------------------------------------------------------------------------

/**
 * 과정은 **수정만** 가능하다.
 * MBA / DBA 두 과정만 존재하므로 생성·삭제 기능을 만들지 않는다.
 */
export async function saveProgram(
  id: string,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = programSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  let type: ProgramType;

  try {
    const updated = await prisma.program.update({
      where: { id },
      data: parsed.data,
      select: { type: true },
    });
    type = updated.type;
  } catch (error) {
    return toErrorState("program", error);
  }

  revalidateProgram(type);
  return { status: "saved" };
}

// ---------------------------------------------------------------------------
// 교과목
// ---------------------------------------------------------------------------

export async function saveCourse(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = courseSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  // 넘어온 programId 가 실제로 있는 과정인지 서버에서 확인한다.
  const program = await prisma.program.findUnique({
    where: { id: parsed.data.programId },
    select: { id: true, type: true },
  });

  if (!program) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  try {
    if (id) {
      await prisma.course.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.course.create({ data: parsed.data });
    }
  } catch (error) {
    return toErrorState("course", error);
  }

  revalidateCourse(program.type);

  if (!id) redirect("/admin/courses");

  return { status: "saved" };
}

export async function deleteCourse(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  let type: ProgramType;

  try {
    const deleted = await prisma.course.delete({
      where: { id },
      select: { program: { select: { type: true } } },
    });
    type = deleted.program.type;
  } catch (error) {
    console.error("[admin][cms][course] 삭제 실패", error);
    return;
  }

  revalidateCourse(type);
  redirect("/admin/courses");
}
