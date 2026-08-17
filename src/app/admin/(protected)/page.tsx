import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { cn } from "@/lib/cn";

/**
 * 관리자 대시보드.
 *
 * 이번 단계에서는 **집계 숫자만** 보여준다. 목록·상세·상태변경은 9단계에서 만든다.
 * 숫자는 Server Component 에서 Prisma 로 직접 조회한다.
 */

export const metadata: Metadata = {
  title: "대시보드 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type Counts = {
  consultationNew: number;
  consultationInProgress: number;
  consultationCompleted: number;
  seminarNew: number;
};

/**
 * 대시보드 집계.
 *
 * DB 가 내려가 있어도 관리자 화면 전체가 죽거나 stack trace 가 노출되면 안 된다.
 * 실패하면 null 을 돌려주고 화면에서 안내 문구로 대체한다. (CLAUDE.md 18항)
 */
async function loadCounts(): Promise<Counts | null> {
  try {
    const [
      consultationNew,
      consultationInProgress,
      consultationCompleted,
      seminarNew,
    ] = await Promise.all([
      prisma.consultation.count({ where: { status: "NEW" } }),
      prisma.consultation.count({ where: { status: "IN_PROGRESS" } }),
      prisma.consultation.count({ where: { status: "COMPLETED" } }),
      prisma.seminarApplication.count({ where: { status: "NEW" } }),
    ]);

    return {
      consultationNew,
      consultationInProgress,
      consultationCompleted,
      seminarNew,
    };
  } catch (error) {
    console.error("[admin] 대시보드 집계 조회 실패", error);
    return null;
  }
}

/** 카드를 누르면 해당 조건으로 걸러진 관리 목록으로 이동한다. */
function StatCard({
  label,
  value,
  hint,
  href,
  emphasis,
}: {
  label: string;
  value: number | null;
  hint: string;
  href: string;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border bg-background px-5 py-5 transition-colors hover:border-navy",
        emphasis && value !== null && value > 0
          ? "border-navy/30 bg-navy-tint"
          : "border-line",
      )}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1.5 font-serif text-3xl font-bold text-navy">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  // layout 에서 이미 확인하지만, 이 화면이 다른 곳에 끼워져도 안전하도록 다시 확인한다.
  const admin = await requireAdmin();
  const counts = await loadCounts();

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="font-serif text-2xl font-bold text-navy">대시보드</h1>
        <p className="mt-2 text-sm text-muted">
          {admin.name} 님, 반갑습니다. 현재 접수 현황입니다.
        </p>
      </header>

      {counts === null && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-[#b3261e]/40 bg-[#b3261e]/[0.05] px-4 py-3 text-sm font-medium text-[#b3261e]"
        >
          접수 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <section className="mt-6" aria-label="접수 현황">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="신규 입학상담"
            value={counts?.consultationNew ?? null}
            hint="아직 확인하지 않은 신청"
            href="/admin/consultations?status=NEW"
            emphasis
          />
          <StatCard
            label="상담중"
            value={counts?.consultationInProgress ?? null}
            hint="처리하고 있는 신청"
            href="/admin/consultations?status=IN_PROGRESS"
          />
          <StatCard
            label="완료"
            value={counts?.consultationCompleted ?? null}
            hint="답변을 마친 신청"
            href="/admin/consultations?status=COMPLETED"
          />
          <StatCard
            label="신규 설명회 신청"
            value={counts?.seminarNew ?? null}
            hint="아직 확인하지 않은 신청"
            href="/admin/seminars?status=NEW"
            emphasis
          />
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-dashed border-line bg-surface px-5 py-5">
        <h2 className="text-sm font-semibold text-navy">다음 단계 안내</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          입학상담·설명회 신청의 <strong>목록 조회 · 상태 변경 · 메모</strong>까지 사용할 수
          있습니다. 콘텐츠·교수진·교육과정·FAQ 관리는 다음 단계에서 추가됩니다.
        </p>
      </section>
    </div>
  );
}
