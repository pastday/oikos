import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { formatDateOnly, formatDateTime } from "@/lib/admin/format";
import {
  admissionFileTypeLabels,
  admissionGenderLabels,
  admissionMaritalStatusLabels,
  admissionTermLabels,
  isSignatureFileType,
} from "@/lib/admin/admission";
import {
  decryptResidentNumber,
  formatResidentNumber,
} from "@/lib/admission/crypto";
import {
  admissionDocumentColumns,
  admissionDocumentList,
} from "@/lib/admission/documents";
import { findAdmissionApplication } from "@/lib/admission/queries";
import { readAdmissionFileAsDataUrl } from "@/lib/admission/storage";
import { PrintButton } from "./PrintButton";

/**
 * 입학원서 인쇄용 화면. (18단계)
 *
 * ## 왜 서버에서 PDF 를 만들지 않는가
 *
 * 서버 PDF 생성은 한글 폰트 임베딩과 무거운 의존성(@react-pdf/renderer 또는 Chromium)을
 * 데려온다. 이 프로젝트의 런타임 의존성은 9개뿐이고, 관리자가 필요할 때 몇 건을
 * 출력하면 되는 용도다. 그래서 **브라우저의 "PDF 로 저장"** 을 쓴다. (지시 23항)
 * 한글 폰트는 관리자 PC 의 것을 그대로 쓰므로 폰트 문제가 아예 생기지 않는다.
 *
 * ## 주민등록번호
 *
 * **이 화면이 평문을 그리는 유일한 곳이다.** 종이 입학원서와 같은 문서를 만드는 것이
 * 목적이기 때문이다. 관리자 인증을 통과해야 하고, `(protected)` layout 이
 * `force-dynamic` 이라 응답이 캐시되지 않는다.
 *
 * ## 서명 이미지
 *
 * `data:` URL 로 HTML 에 심는다. 그러면 인쇄할 때 이미지 주소를 따로 요청하지 않아
 * 브라우저 기록에 파일 주소가 남지 않고, 인쇄 미리보기에서 이미지가 빠지는 일도 없다.
 */

export const metadata: Metadata = {
  title: "입학원서 인쇄 | Oikos 관리자",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdmissionPrintPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const application = await findAdmissionApplication(id);

  if (!application) notFound();

  // 복호화는 이 함수 안에서 끝난다. 값은 아래 표 한 칸에만 들어간다.
  let residentNumber: string;
  try {
    residentNumber = formatResidentNumber(
      decryptResidentNumber(application.residentNumberEncrypted),
    );
  } catch {
    // 키가 바뀌었거나 값이 손상된 경우. 화면을 깨뜨리지 않는다.
    residentNumber = "(복호화 실패)";
  }

  const signatureFiles = application.files.filter((file) =>
    isSignatureFileType(file.type),
  );

  const signatureImages = new Map<string, string>();
  for (const file of signatureFiles) {
    const dataUrl = await readAdmissionFileAsDataUrl(file.path, file.mimeType);
    if (dataUrl) signatureImages.set(file.type, dataUrl);
  }

  const attachments = application.files.filter(
    (file) => !isSignatureFileType(file.type),
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* 인쇄물에는 들어가지 않는 화면 전용 조작부 */}
      <div className="admin-print-hide mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/admissions/${application.id}`}
          className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy"
        >
          상세로 돌아가기
        </Link>
        <PrintButton label="인쇄 / PDF 저장" />
      </div>

      <article className="bg-white px-10 py-10 text-[13px] leading-relaxed text-black">
        <header className="border-b-2 border-black pb-4 text-center">
          <p className="font-serif text-lg font-bold tracking-[0.2em]">
            OIKOS UNIVERSITY
          </p>
          <h1 className="mt-2 font-serif text-xl font-bold">
            APPLICATION FOR ADMISSION 입학신청서
          </h1>
          <p className="mt-2 text-xs">
            접수번호 {application.applicationNo} · 제출일{" "}
            {formatDateTime(application.submittedAt)}
          </p>
        </header>

        <PrintSection title="▣ 지원 과정">
          <Table
            rows={[
              ["지원 과정", application.program],
              [
                "입학 학기",
                `${application.admissionYear} · ${admissionTermLabels[application.admissionTerm]}`,
              ],
            ]}
          />
        </PrintSection>

        <PrintSection title="▣ Personal Information 인적사항">
          <Table
            rows={[
              ["이름 (한글)", application.nameKo],
              ["이름 (영문)", application.nameEn],
              ["주민등록번호", residentNumber],
              ["생년월일", formatDateOnly(application.birthDate)],
              ["성별", admissionGenderLabels[application.gender]],
              ["국적", application.nationality],
              ["출생지", application.birthplace],
              ["주소", application.addressKo],
              ["영문주소", application.addressEn],
              ["전화번호", application.phone],
              ["이메일 주소", application.email],
              ["미국시민 여부", application.usCitizen ? "Yes" : "No"],
              [
                "혼인상태",
                application.maritalStatus
                  ? admissionMaritalStatusLabels[application.maritalStatus]
                  : "-",
              ],
              ["운전면허번호", application.driversLicenseNumber ?? "-"],
              ["발행장소", application.driversLicenseIssuedAt ?? "-"],
            ]}
          />
        </PrintSection>

        <PrintSection title="▣ 비상연락처">
          <Table
            rows={[
              ["이름", application.emergencyName],
              ["관계", application.emergencyRelationship],
              ["전화번호", application.emergencyPhone],
              ["주소", application.emergencyAddress],
            ]}
          />
        </PrintSection>

        <PrintSection title="▣ 학력 Education">
          <GridTable
            headers={["학교명", "학교 주소", "재학기간", "학위명"]}
            rows={application.educations.map((row) => [
              row.schoolName,
              row.schoolAddress ?? "-",
              row.period ?? "-",
              row.degreeName ?? "-",
            ])}
          />
        </PrintSection>

        <PrintSection title="▣ 경력 Career">
          {application.careers.length === 0 ? (
            <p className="py-2">해당 없음</p>
          ) : (
            <GridTable
              headers={["직장명", "기간", "직위"]}
              rows={application.careers.map((row) => [
                row.organization,
                row.period ?? "-",
                row.position ?? "-",
              ])}
            />
          )}
        </PrintSection>

        <PrintSection title="▣ Personal Statement 자기소개서" pageBreak>
          <StatementBlock
            label="자기소개"
            body={application.personalIntroduction}
          />
          <StatementBlock label="지원동기" body={application.motivation} />
          <StatementBlock
            label="학업 및 향후 계획"
            body={application.studyPlan}
          />
        </PrintSection>

        {admissionDocumentList.map((document) => {
          const columns = admissionDocumentColumns[document.key];
          const agreed = application[columns.agreed];
          const signedName = application[columns.signedName];
          const signedAt = application[columns.signedAt];
          const image = signatureImages.get(document.signatureFileType);

          return (
            <PrintSection key={document.key} title={document.title} pageBreak>
              <div className="space-y-3">
                {document.blocks.map((block, index) => (
                  <div key={index}>
                    {block.heading && (
                      <h3 className="font-semibold">{block.heading}</h3>
                    )}
                    {block.paragraphs?.map((paragraph, position) => (
                      <p key={position} className="mt-1">
                        {paragraph}
                      </p>
                    ))}
                    {block.items && (
                      <ul className="mt-1 list-disc pl-5">
                        {block.items.map((item, position) => (
                          <li key={position}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-4 font-medium">{document.attestation}</p>

              <div className="mt-4 flex flex-wrap items-end gap-8 border-t border-black/30 pt-4">
                <div>
                  <p className="text-xs">Name 이름</p>
                  <p className="mt-1 font-semibold">{signedName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs">Date 날짜</p>
                  <p className="mt-1 font-semibold">
                    {signedAt ? formatDateTime(signedAt) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Sign 서명</p>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data: URL 이라 next/image 최적화 대상이 아니다
                    <img
                      src={image}
                      alt={`${document.title} 서명`}
                      className="mt-1 h-16 w-auto"
                    />
                  ) : (
                    <p className="mt-1">(서명 파일 없음)</p>
                  )}
                </div>
                <p className="ml-auto text-xs">
                  동의 여부: {agreed ? "동의함" : "동의 안 함"}
                </p>
              </div>
            </PrintSection>
          );
        })}

        <PrintSection title="▣ 제출서류">
          {attachments.length === 0 ? (
            <p className="py-2">첨부된 파일이 없습니다.</p>
          ) : (
            <ul className="list-disc pl-5">
              {attachments.map((file) => (
                <li key={file.id}>
                  {admissionFileTypeLabels[file.type]} — {file.originalName}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs">
            첨부 파일 원본은 관리자 화면에서 개별로 내려받습니다. 이 문서에는
            포함되지 않습니다.
          </p>
        </PrintSection>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PrintSection({
  title,
  pageBreak,
  children,
}: {
  title: string;
  /** 인쇄할 때 이 절부터 새 쪽에서 시작한다. */
  pageBreak?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mt-6 ${pageBreak ? "admin-print-break" : ""}`}
    >
      <h2 className="mb-2 border-b border-black pb-1 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-black/20">
            <th className="w-40 py-1.5 pr-3 text-left align-top font-medium">
              {label}
            </th>
            <td className="py-1.5 break-words">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GridTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-black">
          {headers.map((header) => (
            <th key={header} className="py-1.5 pr-3 text-left font-medium">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, index) => (
          <tr key={index} className="border-b border-black/20">
            {cells.map((cell, position) => (
              <td key={position} className="py-1.5 pr-3 align-top break-words">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 지원자가 쓴 글. HTML 로 렌더링하지 않고 줄바꿈만 CSS 로 살린다. */
function StatementBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-3 first:mt-0">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-1 whitespace-pre-wrap">{body}</p>
    </div>
  );
}
