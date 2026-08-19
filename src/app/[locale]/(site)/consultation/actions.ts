"use server";

import { isLocale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import {
  consultationErrorCodes,
  consultationFields,
  consultationSchema,
  MIN_FILL_MS,
  seminarErrorCodes,
  seminarFields,
  seminarSchema,
  spamGuardFields,
  toFieldErrors,
  type ConsultationErrorCode,
  type ConsultationField,
  type SeminarErrorCode,
  type SeminarField,
} from "@/lib/validation/inquiry";

/**
 * 입학상담 · 설명회 신청 서버 액션.
 *
 * 제출 방식으로 Route Handler 대신 **Server Action** 을 쓰는 이유
 *  - 이 프로젝트에는 아직 공개 API 가 없다. 폼 하나 때문에 외부에 열린 엔드포인트를 늘리지 않는다.
 *  - 폼과 처리 코드가 같은 타입을 공유하므로 필드가 바뀌면 컴파일 단계에서 드러난다.
 *  - Next.js 가 CSRF 방어(Origin/Host 검증)를 기본 제공하고, 요청 본문이 액션 ID 로 묶여 있어
 *    임의 JSON 을 밀어 넣기 어렵다.
 *
 * DB 쓰기는 이 파일(서버)에서만 일어난다. 브라우저는 Prisma 를 직접 쓰지 않는다.
 */

// ---------------------------------------------------------------------------
// 폼 상태
// ---------------------------------------------------------------------------

type FormState<Field extends string, Code extends string> =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Partial<Record<Field, Code>> }
  | { status: "error" };

export type ConsultationFormState = FormState<
  ConsultationField,
  ConsultationErrorCode
>;
export type SeminarFormState = FormState<SeminarField, SeminarErrorCode>;

// "use server" 파일은 async 함수만 export 할 수 있다.
// 초기 상태 상수는 각 폼 컴포넌트에서 직접 만든다.

// ---------------------------------------------------------------------------
// 공통 처리
// ---------------------------------------------------------------------------

/** 같은 이메일로 이 시간 안에 다시 들어온 신청은 중복 제출로 본다. */
const DUPLICATE_WINDOW_MS = 60_000;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * 스팸으로 판단되면 true. 판정은 서버에서만 한다.
 *
 * loadedAt 값이 없으면(JS 미실행 등) 통과시킨다. 정상 사용자를 막지 않는 쪽을 택한다.
 */
function isLikelySpam(formData: FormData): boolean {
  if (readText(formData, spamGuardFields.honeypot).trim().length > 0) {
    return true;
  }

  const loadedAt = Number(readText(formData, spamGuardFields.loadedAt));
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) return false;

  return Date.now() - loadedAt < MIN_FILL_MS;
}

/** 사용자에게는 원인을 알리지 않는다. 서버 로그에만 남긴다. (CLAUDE.md 18항) */
function logFailure(scope: string, error: unknown): void {
  console.error(`[${scope}] 신청 저장 실패`, error);
}

// ---------------------------------------------------------------------------
// 입학상담
// ---------------------------------------------------------------------------

export async function submitConsultation(
  locale: string,
  _prevState: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  // locale 은 URL 에서 넘어오지만 클라이언트를 거치므로 서버에서 다시 확인한다.
  if (!isLocale(locale)) return { status: "error" };

  // 봇에게는 실패를 알리지 않는다. 저장은 하지 않는다.
  if (isLikelySpam(formData)) return { status: "success" };

  const parsed = consultationSchema.safeParse({
    name: readText(formData, "name"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
    interestedProgram: readText(formData, "interestedProgram"),
    message: readText(formData, "message"),
    privacyAgreed: formData.get("privacyAgreed") === "on",
  });

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: toFieldErrors(
        parsed.error,
        consultationFields,
        consultationErrorCodes,
      ),
    };
  }

  const input = parsed.data;

  try {
    const recent = await prisma.consultation.findFirst({
      where: {
        email: input.email,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { id: true },
    });

    // 새로고침·더블클릭으로 같은 신청이 두 번 저장되지 않게 한다.
    if (recent) return { status: "success" };

    await prisma.consultation.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        interestedProgram: input.interestedProgram,
        message: input.message,
        privacyAgreed: true,
        locale,
        // status 는 DB 기본값 NEW 를 쓴다. adminMemo 는 관리자 전용이라 여기서 받지 않는다.
      },
    });
  } catch (error) {
    logFailure("consultation", error);
    return { status: "error" };
  }

  return { status: "success" };
}

// ---------------------------------------------------------------------------
// 설명회 신청
// ---------------------------------------------------------------------------

export async function submitSeminarApplication(
  locale: string,
  _prevState: SeminarFormState,
  formData: FormData,
): Promise<SeminarFormState> {
  if (!isLocale(locale)) return { status: "error" };
  if (isLikelySpam(formData)) return { status: "success" };

  const parsed = seminarSchema.safeParse({
    name: readText(formData, "name"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
    preferredSession: readText(formData, "preferredSession"),
    attendeeCount: readText(formData, "attendeeCount"),
    memo: readText(formData, "memo"),
    privacyAgreed: formData.get("privacyAgreed") === "on",
  });

  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: toFieldErrors(parsed.error, seminarFields, seminarErrorCodes),
    };
  }

  const input = parsed.data;

  try {
    const recent = await prisma.seminarApplication.findFirst({
      where: {
        email: input.email,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { id: true },
    });

    if (recent) return { status: "success" };

    await prisma.seminarApplication.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        preferredSession: input.preferredSession,
        attendeeCount: input.attendeeCount,
        memo: input.memo,
        privacyAgreed: true,
        locale,
      },
    });
  } catch (error) {
    logFailure("seminar", error);
    return { status: "error" };
  }

  return { status: "success" };
}
