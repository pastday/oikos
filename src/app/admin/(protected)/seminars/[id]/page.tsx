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
import { updateSeminarApplication } from "../../inquiry-actions";
import { seminarStatusLabels } from "@/lib/admin/inquiry";
import { localeLabels } from "@/lib/admin/format";

export const metadata: Metadata = {
  title: "설명회 신청 상세 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function SeminarDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const application = await prisma.seminarApplication.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      preferredSession: true,
      attendeeCount: true,
      memo: true,
      privacyAgreed: true,
      locale: true,
      status: true,
      adminMemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!application) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AdminPageHeader
        title="설명회 신청 상세"
        description={`신청자 ${application.name}`}
      >
        <Link
          href="/admin/seminars"
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
              status={application.status}
              label={seminarStatusLabels[application.status]}
            />
          </DetailRow>
          <DetailRow label="이름">{application.name}</DetailRow>
          <DetailRow label="연락처">
            <a
              href={`tel:${application.phone.replace(/[^0-9+]/g, "")}`}
              className="text-navy underline-offset-4 hover:underline"
            >
              {application.phone}
            </a>
          </DetailRow>
          <DetailRow label="이메일">
            <a
              href={`mailto:${application.email}`}
              className="text-navy underline-offset-4 hover:underline"
            >
              {application.email}
            </a>
          </DetailRow>
          <DetailRow label="희망 설명회">
            {application.preferredSession ? (
              <p className="whitespace-pre-wrap">
                {application.preferredSession}
              </p>
            ) : (
              <EmptyValue text="미입력" />
            )}
          </DetailRow>
          <DetailRow label="참석 인원">{application.attendeeCount}명</DetailRow>
          <DetailRow label="메모">
            {application.memo ? (
              // 신청자가 쓴 글이다. HTML 로 렌더링하지 않는다.
              <p className="whitespace-pre-wrap">{application.memo}</p>
            ) : (
              <EmptyValue text="미입력" />
            )}
          </DetailRow>
          <DetailRow label="신청 언어">
            {localeLabels[application.locale] ?? application.locale}
          </DetailRow>
          <DetailRow label="개인정보 동의">
            {application.privacyAgreed ? "동의함" : "동의 안 함"}
          </DetailRow>
          <DetailRow label="신청일">
            <DateTimeText value={application.createdAt} />
          </DetailRow>
          <DetailRow label="최종 수정일">
            <DateTimeText value={application.updatedAt} />
          </DetailRow>
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-background px-5 py-5">
        <h2 className="text-sm font-semibold text-navy">처리 상태 · 메모</h2>
        <p className="mt-1 mb-5 text-xs text-muted">
          변경 내용은 신청자에게 자동으로 전달되지 않습니다.
        </p>

        <InquiryEditForm
          id={application.id}
          action={updateSeminarApplication}
          currentStatus={application.status}
          currentMemo={application.adminMemo}
          statusLabels={seminarStatusLabels}
          memoHint="관리자만 볼 수 있는 내부 기록입니다. 신청자에게는 표시되지 않습니다."
        />
      </section>
    </div>
  );
}
