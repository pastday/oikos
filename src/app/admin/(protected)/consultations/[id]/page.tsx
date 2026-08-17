import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DateTimeText,
  DetailRow,
  EmptyValue,
  StatusBadge,
} from "@/components/admin/ui";
import { InquiryEditForm } from "@/components/admin/InquiryEditForm";
import { updateConsultation } from "../../inquiry-actions";
import { consultationStatusLabels } from "@/lib/admin/inquiry";
import { localeLabels } from "@/lib/admin/format";

export const metadata: Metadata = {
  title: "입학상담 상세 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ConsultationDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      interestedProgram: true,
      message: true,
      privacyAgreed: true,
      locale: true,
      status: true,
      adminMemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 없는 id 로 접근하면 404. DB 오류 원문을 화면에 내보내지 않는다.
  if (!consultation) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AdminPageHeader
        title="입학상담 상세"
        description={`신청자 ${consultation.name}`}
      >
        <Link
          href="/admin/consultations"
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          목록으로
        </Link>
      </AdminPageHeader>

      <section className="rounded-lg border border-line bg-background px-5 py-4">
        <h2 className="sr-only">신청 내용</h2>
        <dl>
          <DetailRow label="상태">
            <StatusBadge
              status={consultation.status}
              label={consultationStatusLabels[consultation.status]}
            />
          </DetailRow>
          <DetailRow label="이름">{consultation.name}</DetailRow>
          <DetailRow label="연락처">
            <a
              href={`tel:${consultation.phone.replace(/[^0-9+]/g, "")}`}
              className="text-navy underline-offset-4 hover:underline"
            >
              {consultation.phone}
            </a>
          </DetailRow>
          <DetailRow label="이메일">
            <a
              href={`mailto:${consultation.email}`}
              className="text-navy underline-offset-4 hover:underline"
            >
              {consultation.email}
            </a>
          </DetailRow>
          <DetailRow label="관심 과정">
            {consultation.interestedProgram ?? <EmptyValue />}
          </DetailRow>
          <DetailRow label="신청 언어">
            {localeLabels[consultation.locale] ?? consultation.locale}
          </DetailRow>
          <DetailRow label="문의내용">
            {consultation.message ? (
              // 신청자가 쓴 글이다. HTML 로 렌더링하지 않는다.
              // React 가 이스케이프하고, 줄바꿈만 CSS 로 살린다.
              <p className="whitespace-pre-wrap">{consultation.message}</p>
            ) : (
              <EmptyValue />
            )}
          </DetailRow>
          <DetailRow label="개인정보 동의">
            {consultation.privacyAgreed ? "동의함" : "동의 안 함"}
          </DetailRow>
          <DetailRow label="신청일">
            <DateTimeText value={consultation.createdAt} />
          </DetailRow>
          <DetailRow label="최종 수정일">
            <DateTimeText value={consultation.updatedAt} />
          </DetailRow>
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-background px-5 py-5">
        <h2 className="text-sm font-semibold text-navy">처리 상태 · 메모</h2>
        <p className="mt-1 mb-5 text-xs text-muted">
          변경 내용은 신청자에게 자동으로 전달되지 않습니다.
        </p>

        <InquiryEditForm
          id={consultation.id}
          action={updateConsultation}
          currentStatus={consultation.status}
          currentMemo={consultation.adminMemo}
          statusLabels={consultationStatusLabels}
          memoHint="관리자만 볼 수 있는 내부 기록입니다. 신청자에게는 표시되지 않습니다."
        />
      </section>
    </div>
  );
}
