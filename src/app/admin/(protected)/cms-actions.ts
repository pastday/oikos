"use server";

import { redirect } from "next/navigation";
import type { ProgramType } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  revalidateAdmissionNumbers,
  revalidateCourse,
  revalidateFaculty,
  revalidateFaq,
  revalidatePageContent,
  revalidateProgram,
} from "@/lib/cms/revalidate";
import {
  admissionNumberSpecs,
  findSection,
  sectionSlots,
} from "@/lib/cms/page-catalog";
import { resolveMediaId } from "@/lib/media/select";
import {
  admissionNumberSchema,
  courseSchema,
  facultySchema,
  faqSchema,
  formDataToObject,
  pageSectionItemSchema,
  pageSectionSchema,
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

/** 미디어 연결이 잘못됐을 때의 안내. 어느 칸이 문제인지 알 수 있게 종류별로 나눈다. */
const MEDIA_IMAGE_ERROR =
  "이미지를 찾을 수 없습니다. 올려 둔 이미지 중에서 선택해 주세요.";
const MEDIA_PDF_ERROR =
  "PDF 를 찾을 수 없습니다. 올려 둔 PDF 중에서 선택해 주세요.";

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

  // 사진은 이미지 Media 만 연결할 수 있다. 없는 id 나 PDF 는 여기서 걸러진다.
  const photoMediaId = await resolveMediaId(parsed.data.photoMediaId, "image");
  if (photoMediaId === "invalid") {
    return { status: "error", message: MEDIA_IMAGE_ERROR };
  }

  const data = { ...parsed.data, photoMediaId };

  try {
    if (id) {
      await prisma.faculty.update({ where: { id }, data });
    } else {
      await prisma.faculty.create({ data });
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

// ---------------------------------------------------------------------------
// 페이지 콘텐츠 (10단계)
// ---------------------------------------------------------------------------

/**
 * 섹션 저장.
 *
 * `pageKey` / `sectionKey` 는 **카탈로그에 있는 것만** 받는다.
 * 화면에 없는 섹션을 만들어 봐야 그려 줄 곳이 없고, 임의의 키를 허용하면
 * 오타로 만들어진 유령 섹션이 DB 에 쌓인다.
 *
 * 저장할 슬롯도 카탈로그가 정한 것만 고른다. (allowlist)
 * 폼에 없는 슬롯을 직접 POST 로 밀어 넣어도 무시된다.
 *
 * seed 를 아직 돌리지 않았거나 섹션 행이 없을 수 있으므로 `upsert` 로 만든다.
 */
export async function savePageSection(
  pageKey: string,
  sectionKey: string,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const found = findSection(pageKey, sectionKey);
  if (!found) {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  const parsed = pageSectionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  // 카탈로그가 정의한 슬롯만 저장 대상으로 남긴다.
  const data: Record<string, string | null> = {};
  for (const slot of sectionSlots(found.section)) {
    data[`${slot}Ko`] = parsed.data[`${slot}Ko`];
    data[`${slot}En`] = parsed.data[`${slot}En`];
  }

  // 미디어도 카탈로그가 허용한 칸만 저장한다.
  // 칸이 없는 섹션에 직접 POST 로 밀어 넣어도 무시된다. (allowlist)
  if (found.section.image) {
    const mediaId = await resolveMediaId(parsed.data.mediaId, "image");
    if (mediaId === "invalid") {
      return { status: "error", message: MEDIA_IMAGE_ERROR };
    }
    data.mediaId = mediaId;
  }

  if (found.section.document) {
    const documentMediaId = await resolveMediaId(
      parsed.data.documentMediaId,
      "pdf",
    );
    if (documentMediaId === "invalid") {
      return { status: "error", message: MEDIA_PDF_ERROR };
    }
    data.documentMediaId = documentMediaId;
  }

  const sortOrder = found.page.sections.findIndex(
    (item) => item.key === sectionKey,
  );

  try {
    await prisma.pageSection.upsert({
      where: { pageKey_sectionKey: { pageKey, sectionKey } },
      update: { ...data, isPublished: parsed.data.isPublished },
      create: {
        pageKey,
        sectionKey,
        ...data,
        sortOrder,
        isPublished: parsed.data.isPublished,
      },
    });
  } catch (error) {
    return toErrorState("page-section", error);
  }

  revalidatePageContent(pageKey);
  return { status: "saved" };
}

/**
 * 섹션 안의 반복 항목 저장.
 *
 * `sectionId` 로 섹션을 찾아 그 섹션이 **카탈로그에 있고 실제로 항목을 쓰는지** 확인한다.
 * 항목을 쓰지 않는 섹션에 항목을 붙이면 화면에 나오지 않으므로 막는다.
 */
export async function savePageSectionItem(
  sectionId: string,
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const section = await prisma.pageSection.findUnique({
    where: { id: sectionId },
    select: { id: true, pageKey: true, sectionKey: true },
  });

  if (!section) {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  const found = findSection(section.pageKey, section.sectionKey);
  if (!found?.section.items) {
    return { status: "error", message: CMS_NOT_FOUND_ERROR };
  }

  const parsed = pageSectionItemSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  const spec = found.section.items;

  // 카탈로그가 허용한 variant 인지 확인한다. 쓰지 않는 목록이면 항상 null 이다.
  const allowed = spec.variants?.map((variant) => variant.value) ?? [];
  const variant =
    parsed.data.variant && allowed.includes(parsed.data.variant)
      ? parsed.data.variant
      : null;

  // 이미지를 쓰지 않는 목록에 mediaId 가 들어오면 버린다.
  let mediaId: string | null = null;

  if (spec.image) {
    const resolved = await resolveMediaId(parsed.data.mediaId, "image");
    if (resolved === "invalid") {
      return { status: "error", message: MEDIA_IMAGE_ERROR };
    }
    mediaId = resolved;
  }

  // label 을 쓰지 않는 목록(등록금 비고)에 label 이 들어오면 버린다.
  const data = {
    labelKo: spec.label ? parsed.data.labelKo : null,
    labelEn: spec.label ? parsed.data.labelEn : null,
    valueKo: spec.value ? parsed.data.valueKo : null,
    valueEn: spec.value ? parsed.data.valueEn : null,
    variant,
    mediaId,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
  };

  try {
    if (id) {
      // 다른 섹션의 항목 id 를 넘겨 남의 데이터를 고치지 못하게 sectionId 를 함께 건다.
      const updated = await prisma.pageSectionItem.updateMany({
        where: { id, sectionId },
        data,
      });

      if (updated.count === 0) {
        return { status: "error", message: CMS_NOT_FOUND_ERROR };
      }
    } else {
      await prisma.pageSectionItem.create({ data: { ...data, sectionId } });
    }
  } catch (error) {
    return toErrorState("page-section-item", error);
  }

  revalidatePageContent(section.pageKey);

  if (!id) {
    redirect(`/admin/pages/${section.pageKey}/${section.sectionKey}`);
  }

  return { status: "saved" };
}

export async function deletePageSectionItem(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  let pageKey: string;
  let sectionKey: string;

  try {
    const deleted = await prisma.pageSectionItem.delete({
      where: { id },
      select: { section: { select: { pageKey: true, sectionKey: true } } },
    });
    pageKey = deleted.section.pageKey;
    sectionKey = deleted.section.sectionKey;
  } catch (error) {
    console.error("[admin][cms][page-section-item] 삭제 실패", error);
    return;
  }

  revalidatePageContent(pageKey);
  redirect(`/admin/pages/${pageKey}/${sectionKey}`);
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export async function saveFaq(
  id: string | null,
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const parsed = faqSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", message: CMS_INVALID_ERROR };
  }

  try {
    if (id) {
      await prisma.fAQ.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.fAQ.create({ data: parsed.data });
    }
  } catch (error) {
    return toErrorState("faq", error);
  }

  revalidateFaq();

  if (!id) redirect("/admin/faq");

  return { status: "saved" };
}

export async function deleteFaq(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  try {
    await prisma.fAQ.delete({ where: { id } });
  } catch (error) {
    console.error("[admin][cms][faq] 삭제 실패", error);
    return;
  }

  revalidateFaq();
  redirect("/admin/faq");
}

// ---------------------------------------------------------------------------
// 입학안내 수치
// ---------------------------------------------------------------------------

/**
 * 등록금·수수료·개강 시점 저장.
 *
 * 카탈로그에 정의된 키만 저장한다. 임의의 `SiteSetting` 키를 만들 수 없다.
 * 값이 비어 있으면 `null` 로 저장하며, 이는 "원본에 금액이 없다" 는 정상 상태다.
 */
export async function saveAdmissionNumbers(
  _prevState: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const raw = formDataToObject(formData);
  const values: { key: string; value: string | null }[] = [];

  for (const spec of admissionNumberSpecs) {
    const parsed = admissionNumberSchema.safeParse(raw[spec.key] ?? "");

    if (!parsed.success) {
      return {
        status: "error",
        message: `${spec.label}: 숫자만 입력할 수 있습니다. 값이 없으면 비워 두세요.`,
      };
    }

    values.push({ key: spec.key, value: parsed.data });
  }

  try {
    // 한 항목만 저장되고 나머지가 실패하는 상태를 만들지 않는다.
    await prisma.$transaction(
      values.map(({ key, value }) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );
  } catch (error) {
    return toErrorState("admission-numbers", error);
  }

  revalidateAdmissionNumbers();
  return { status: "saved" };
}
