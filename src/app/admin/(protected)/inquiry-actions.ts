"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { inquiryStatuses } from "@/lib/admin/inquiry";

/**
 * 입학상담 · 설명회 신청의 상태와 관리자 메모를 저장한다.
 *
 * 제출 방식으로 Route Handler 대신 **Server Action** 을 쓰는 이유는 6단계와 같다.
 * 공개 API 를 늘리지 않고, Next.js 가 Server Action 요청의 Origin 을 검증하므로
 * 별도의 CSRF 토큰 체계를 직접 만들지 않아도 된다. (CLAUDE.md 18항)
 *
 * **중요: layout 의 인증을 믿지 않는다.**
 * 서버 액션은 layout 을 거치지 않고 직접 호출될 수 있으므로 액션 안에서 다시 확인한다.
 */

/** 관리자 메모 최대 길이. 내부 기록용이라 넉넉하게 두되 무제한은 아니다. */
const MAX_ADMIN_MEMO = 5000;

const updateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: z.enum(inquiryStatuses),
  adminMemo: z
    .string()
    .max(MAX_ADMIN_MEMO)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }),
});

export type InquiryUpdateState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

const GENERIC_ERROR = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
const INVALID_ERROR = "입력값을 확인해 주세요.";
const NOT_FOUND_ERROR = "대상을 찾을 수 없습니다.";

function readForm(formData: FormData) {
  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  return {
    id: read("id"),
    status: read("status"),
    adminMemo: read("adminMemo"),
  };
}

// ---------------------------------------------------------------------------
// 입학상담
// ---------------------------------------------------------------------------

export async function updateConsultation(
  _prevState: InquiryUpdateState,
  formData: FormData,
): Promise<InquiryUpdateState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { status: "error", message: INVALID_ERROR };
  }

  const { id, status, adminMemo } = parsed.data;

  try {
    // status / adminMemo 외의 필드는 건드리지 않는다.
    // 신청자가 입력한 내용은 관리자가 고칠 수 있는 값이 아니다.
    await prisma.consultation.update({
      where: { id },
      data: { status, adminMemo },
    });
  } catch (error) {
    return handleUpdateError("consultation", id, error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/consultations/${id}`);

  return { status: "saved" };
}

// ---------------------------------------------------------------------------
// 설명회 신청
// ---------------------------------------------------------------------------

export async function updateSeminarApplication(
  _prevState: InquiryUpdateState,
  formData: FormData,
): Promise<InquiryUpdateState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { status: "error", message: INVALID_ERROR };
  }

  const { id, status, adminMemo } = parsed.data;

  try {
    await prisma.seminarApplication.update({
      where: { id },
      data: { status, adminMemo },
    });
  } catch (error) {
    return handleUpdateError("seminar", id, error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/seminars");
  revalidatePath(`/admin/seminars/${id}`);

  return { status: "saved" };
}

// ---------------------------------------------------------------------------

/**
 * 저장 실패 처리.
 *
 * Prisma 오류 원문이나 stack trace 를 화면으로 내보내지 않는다.
 * 없는 id 를 고치려 한 경우(P2025)만 사용자에게 의미 있는 문구로 구분해 준다.
 */
function handleUpdateError(
  scope: string,
  id: string,
  error: unknown,
): InquiryUpdateState {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "P2025") {
    return { status: "error", message: NOT_FOUND_ERROR };
  }

  // 개인정보가 섞이지 않도록 id 와 오류만 남긴다.
  console.error(`[admin][${scope}] 저장 실패 (id=${id})`, error);
  return { status: "error", message: GENERIC_ERROR };
}
