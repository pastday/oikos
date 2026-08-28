import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import {
  AdminPageHeader,
  DateTimeText,
  DetailRow,
  EmptyValue,
  StatusBadge,
} from "@/components/admin/ui";
import { InquiryEditForm } from "@/components/admin/InquiryEditForm";
import { formatDateOnly, localeLabels } from "@/lib/admin/format";
import {
  admissionFileTypeLabels,
  admissionGenderLabels,
  admissionMaritalStatusLabels,
  admissionStatusLabels,
  admissionStatuses,
  admissionTermLabels,
  isSignatureFileType,
} from "@/lib/admin/admission";
import { maskEncryptedResidentNumber } from "@/lib/admission/crypto";
import {
  admissionDocumentList,
  admissionDocumentColumns,
} from "@/lib/admission/documents";
import { findAdmissionApplication } from "@/lib/admission/queries";
import { formatFileSize } from "@/lib/admission/form-config";
import { updateAdmissionApplication } from "../../admission-actions";

/**
 * 입학신청 상세. (18단계)
 *
 * ## 주민등록번호
 *
 * 이 화면은 **마스킹된 값만** 그린다. (`900101-1******`)
 * 복호화한 평문이 렌더 트리에 들어오지 않도록 `maskEncryptedResidentNumber()` 가
 * 암호문을 받아 마스킹까지 한 번에 끝낸다. 전체 값이 필요하면 인쇄 화면을 쓴다.
 *
 * ## 첨부파일
 *
 * 미리보기·썸네일을 만들지 않는다. 목록 화면을 그리는 것만으로 여권 이미지가
 * 브라우저 캐시로 흘러가지 않게 하기 위해서다. 다운로드 링크만 둔다.
 */

export const metadata: Metadata = {
  title: "입학신청 상세 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdmissionDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const application = await findAdmissionApplication(id);

  if (!application) notFound();

  const attachments = application.files.filter(
    (file) => !isSignatureFileType(file.type),
  );
  const signatures = application.files.filter((file) =>
    isSignatureFileType(file.type),
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <AdminPageHeader
        title={`입학신청 ${application.applicationNo}`}
        description={`${application.nameKo} · ${application.program}`}
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/admissions/${application.id}/print`}
            className="rounded-md border border-navy bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            인쇄 / PDF 저장
          </Link>
          <Link
            href="/admin/admissions"
            className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
          >
            목록으로
          </Link>
        </div>
      </AdminPageHeader>

      {/* --- 기본정보 -------------------------------------------------- */}
      <Panel title="기본정보">
        <dl>
          <DetailRow label="상태">
            <StatusBadge
              status={application.status}
              label={admissionStatusLabels[application.status]}
            />
          </DetailRow>
          <DetailRow label="접수번호">{application.applicationNo}</DetailRow>
          <DetailRow label="지원 과정">
            {application.program} · {application.admissionYear}{" "}
            {admissionTermLabels[application.admissionTerm]}
          </DetailRow>
          <DetailRow label="이름">
            {application.nameKo}
            <span className="ml-2 text-muted">{application.nameEn}</span>
          </DetailRow>
          <DetailRow label="주민등록번호">
            <span className="font-mono">
              {maskEncryptedResidentNumber(
                application.residentNumberEncrypted,
              )}
            </span>
            <span className="ml-2 text-xs text-muted">
              전체 번호는 인쇄 화면에서 확인합니다.
            </span>
          </DetailRow>
          <DetailRow label="생년월일">
            {formatDateOnly(application.birthDate)}
          </DetailRow>
          <DetailRow label="성별">
            {admissionGenderLabels[application.gender]}
          </DetailRow>
          <DetailRow label="국적">{application.nationality}</DetailRow>
          <DetailRow label="출생지">{application.birthplace}</DetailRow>
          <DetailRow label="미국 시민권">
            {application.usCitizen ? "예" : "아니오"}
          </DetailRow>
          <DetailRow label="주소 (한글)">{application.addressKo}</DetailRow>
          <DetailRow label="주소 (영문)">{application.addressEn}</DetailRow>
          <DetailRow label="휴대전화">
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
          <DetailRow label="혼인상태">
            {application.maritalStatus ? (
              admissionMaritalStatusLabels[application.maritalStatus]
            ) : (
              <EmptyValue />
            )}
          </DetailRow>
          <DetailRow label="운전면허">
            {application.driversLicenseNumber ? (
              <>
                {application.driversLicenseNumber}
                {application.driversLicenseIssuedAt && (
                  <span className="ml-2 text-muted">
                    ({application.driversLicenseIssuedAt})
                  </span>
                )}
              </>
            ) : (
              <EmptyValue />
            )}
          </DetailRow>
          <DetailRow label="비상연락처">
            {application.emergencyName} ({application.emergencyRelationship}) ·{" "}
            {application.emergencyPhone}
            <br />
            <span className="text-muted">{application.emergencyAddress}</span>
          </DetailRow>
          <DetailRow label="신청 언어">
            {localeLabels[application.locale] ?? application.locale}
          </DetailRow>
          <DetailRow label="개인정보 동의">
            {application.privacyAgreed ? "동의함" : "동의 안 함"}
          </DetailRow>
          <DetailRow label="제출일">
            <DateTimeText value={application.submittedAt} />
          </DetailRow>
        </dl>
      </Panel>

      {/* --- 학력 ------------------------------------------------------ */}
      <Panel title="학력">
        {application.educations.length === 0 ? (
          <p className="py-2 text-sm text-muted">등록된 학력이 없습니다.</p>
        ) : (
          <SimpleTable
            headers={["학교명", "학위명", "재학기간", "학교 주소"]}
            rows={application.educations.map((row) => [
              row.schoolName,
              row.degreeName,
              row.period,
              row.schoolAddress,
            ])}
          />
        )}
      </Panel>

      {/* --- 경력 ------------------------------------------------------ */}
      <Panel title="경력">
        {application.careers.length === 0 ? (
          <p className="py-2 text-sm text-muted">등록된 경력이 없습니다.</p>
        ) : (
          <SimpleTable
            headers={["직장명", "기간", "직위"]}
            rows={application.careers.map((row) => [
              row.organization,
              row.period,
              row.position,
            ])}
          />
        )}
      </Panel>

      {/* --- 자기소개 -------------------------------------------------- */}
      <Panel title="자기소개">
        <div className="flex flex-col gap-5">
          <Statement label="자기소개" body={application.personalIntroduction} />
          <Statement label="지원동기" body={application.motivation} />
          <Statement label="학업 및 향후 계획" body={application.studyPlan} />
        </div>
      </Panel>

      {/* --- 확인서 ---------------------------------------------------- */}
      <Panel title="확인서 · 서명">
        <dl>
          {admissionDocumentList.map((document) => {
            const columns = admissionDocumentColumns[document.key];
            const agreed = application[columns.agreed];
            const signedName = application[columns.signedName];
            const signedAt = application[columns.signedAt];
            const signature = signatures.find(
              (file) => file.type === document.signatureFileType,
            );

            return (
              <DetailRow key={document.key} label={document.title}>
                <span className={agreed ? "text-navy" : "text-[#b3261e]"}>
                  {agreed ? "동의함" : "동의 안 함"}
                </span>
                {signedName && (
                  <span className="ml-2 text-muted">서명자 {signedName}</span>
                )}
                {signedAt && (
                  <span className="ml-2 text-muted">
                    <DateTimeText value={signedAt} />
                  </span>
                )}
                {signature ? (
                  <>
                    {" · "}
                    <Link
                      href={`/admin/admissions/${application.id}/files/${signature.id}`}
                      className="text-navy underline-offset-4 hover:underline"
                    >
                      서명 이미지 내려받기
                    </Link>
                  </>
                ) : (
                  <span className="ml-2 text-[#b3261e]">서명 파일 없음</span>
                )}
              </DetailRow>
            );
          })}
        </dl>
      </Panel>

      {/* --- 첨부파일 -------------------------------------------------- */}
      <Panel title="첨부파일">
        {attachments.length === 0 ? (
          <p className="py-2 text-sm text-muted">첨부된 파일이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">
                    {admissionFileTypeLabels[file.type]}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {file.originalName} · {formatFileSize(file.size)}
                  </p>
                </div>

                <Link
                  href={`/admin/admissions/${application.id}/files/${file.id}`}
                  className="shrink-0 rounded-md border border-line px-4 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
                >
                  내려받기
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* --- 상태 · 메모 ----------------------------------------------- */}
      <section className="rounded-lg border border-line bg-background px-5 py-5">
        <h2 className="text-sm font-semibold text-navy">처리 상태 · 메모</h2>
        <p className="mt-1 mb-5 text-xs text-muted">
          변경 내용은 지원자에게 자동으로 전달되지 않습니다.
        </p>

        <InquiryEditForm
          id={application.id}
          action={updateAdmissionApplication}
          statuses={admissionStatuses}
          currentStatus={application.status}
          currentMemo={application.adminMemo}
          statusLabels={admissionStatusLabels}
          memoHint="관리자만 볼 수 있는 내부 기록입니다. 지원자에게는 표시되지 않습니다."
        />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-background px-5 py-4">
      <h2 className="mb-2 text-sm font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}

/** 지원자가 쓴 글. HTML 로 렌더링하지 않고 줄바꿈만 CSS 로 살린다. */
function Statement({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted">{label}</h3>
      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">
        {body}
      </p>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | null)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            {headers.map((header) => (
              <th key={header} className="py-2 pr-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} className="border-b border-line last:border-b-0">
              {cells.map((cell, position) => (
                <td key={position} className="py-2.5 pr-4 text-foreground/85">
                  {cell ? cell : <EmptyValue />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
