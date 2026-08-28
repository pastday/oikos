"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { admissionStatuses } from "@/lib/admin/admission";
import type { InquiryUpdateState } from "./inquiry-actions";

/**
 * 입학신청의 상태와 관리자 메모를 저장한다. (18단계)
 *
 * 상담·설명회(`inquiry-actions.ts`)와 저장하는 값의 모양이 (status, adminMemo) 로 같아서
 * **화면(`InquiryEditForm`)과 상태 타입(`InquiryUpdateState`)을 그대로 재사용한다.**
 * 다른 것은 상태 enum 과 대상 테이블뿐이라 액션만 따로 둔다.
 *
 * **중요: layout 의 인증을 믿지 않는다.**
 * 서버 액션은 layout 을 거치지 않고 직접 호출될 수 있으므로 액션 안에서 다시 확인한다.
 *
 * ⚠️ **지원자가 입력한 값은 관리자도 고치지 않는다.** 상담 관리와 같은 원칙이며,
 * 여기서 건드리는 컬럼은 `status` 와 `adminMemo` 둘뿐이다. 삭제 기능은 없다.
 */

const MAX_ADMIN_MEMO = 5000;

const updateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: z.enum(admissionStatuses),
  adminMemo: z
    .string()
    .max(MAX_ADMIN_MEMO)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }),
});

const GENERIC_ERROR = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
const INVALID_ERROR = "입력값을 확인해 주세요.";
const NOT_FOUND_ERROR = "대상을 찾을 수 없습니다.";

export async function updateAdmissionApplication(
  _prevState: InquiryUpdateState,
  formData: FormData,
): Promise<InquiryUpdateState> {
  await requireAdmin();

  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const parsed = updateSchema.safeParse({
    id: read("id"),
    status: read("status"),
    adminMemo: read("adminMemo"),
  });

  if (!parsed.success) {
    return { status: "error", message: INVALID_ERROR };
  }

  const { id, status, adminMemo } = parsed.data;

  try {
    await prisma.admissionApplication.update({
      where: { id },
      data: { status, adminMemo },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: unknown }).code
        : undefined;

    if (code === "P2025") {
      return { status: "error", message: NOT_FOUND_ERROR };
    }

    // 개인정보가 섞이지 않도록 id 와 오류만 남긴다.
    console.error(`[admin][admission] 저장 실패 (id=${id})`, error);
    return { status: "error", message: GENERIC_ERROR };
  }

  // 관리자 화면은 `(protected)/layout.tsx` 에서 force-dynamic 이라
  // 요청마다 다시 그려진다. revalidatePath 를 부를 필요가 없다.
  return { status: "saved" };
}
