import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AdmissionExtension } from "./form-config";

/**
 * 입학신청 첨부파일의 **비공개** 저장소. (18단계)
 *
 * ## 기존 Media 와 무엇이 다른가
 *
 * `src/lib/media/storage.ts` 가 다루는 파일은 교수 사진·모집요강처럼 누구나 봐야 하는
 * 자료라서 `/media/<uuid>.jpg` 로 **인증 없이** 서빙되고 1년 캐시가 걸린다.
 *
 * 여기 있는 파일은 여권 사본·성적증명서·서명이다. **공개 라우트가 존재하지 않는다.**
 * 관리자 로그인 뒤 `/admin/admissions/[id]/files/[fileId]` 로만 나간다.
 * 두 저장소를 물리적으로 분리해 두면, 실수로 Media 행을 만들어도 이 파일들은 노출되지 않는다.
 *
 * ## 운영 주의
 *
 * systemd 유닛에 `ProtectHome=read-only` 가 걸려 있다.
 * `ReadWritePaths` 에 아래 디렉터리를 넣지 않으면 저장이 EROFS/EACCES 로 실패한다.
 * `deploy/systemd/oikos.service` 참고.
 *
 * ## `turbopackIgnore` 주석
 *
 * 경로를 상수가 아니라 변수로 만들면 Next 의 정적 분석이 "프로젝트 전체를 배포에 포함" 으로
 * 판단해 경고한다. 의도적으로 프로젝트 밖의 고정 디렉터리를 쓰는 것이므로 추적에서 뺀다.
 * (기존 `media/storage.ts` 와 같은 이유·같은 방식이다)
 */

/** 기본 저장 위치. 공개 업로드(`../oikos-data/uploads`)와 형제로 두되 디렉터리를 나눈다. */
const DEFAULT_DIR = path.resolve(process.cwd(), "../oikos-data/admissions");

export const admissionUploadDir =
  process.env.ADMISSION_UPLOAD_DIR?.trim() || DEFAULT_DIR;

/**
 * 저장 파일명 형태. **우리가 만든 이름만** 통과한다.
 * 사용자가 준 원본 파일명은 경로에 전혀 쓰이지 않으므로 `../` 가 들어올 자리가 없고,
 * 이 검사는 파일에 닿는 시점에 그 사실을 한 번 더 확인하는 안전망이다.
 */
const STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|pdf)$/;

/** 신청서 id 는 cuid 다. 디렉터리 이름으로 쓰이므로 형태를 제한한다. */
const APPLICATION_ID_PATTERN = /^[a-z0-9]{20,40}$/;

export function isSafeStoredName(name: string): boolean {
  return STORED_NAME_PATTERN.test(name);
}

/** 새 저장 파일명을 만든다. */
export function createStoredName(extension: AdmissionExtension): string {
  return `${randomUUID()}.${extension}`;
}

/**
 * DB 에 넣을 상대 경로. **공개 URL 이 아니다.**
 * 저장 루트를 바꿔도 DB 를 손대지 않아도 되도록 루트를 뺀 값만 넣는다.
 */
export function admissionRelativePath(
  applicationId: string,
  storedName: string,
): string {
  return `${applicationId}/${storedName}`;
}

/**
 * 상대 경로를 실제 파일 경로로 바꾼다. 형식에 맞지 않으면 **경로를 만들지 않고** null.
 *
 * 방어를 세 겹 둔다.
 *  1. id·파일명 형태 검사
 *  2. `path.basename` 으로 한 번 더 잘라내기
 *  3. `path.resolve` 결과가 저장 루트 안인지 확인
 *
 * 셋 중 하나만 있어도 충분하지만, 파일시스템에 직접 닿는 곳이라 겹쳐 둔다.
 */
export function resolveAdmissionFilePath(relativePath: string): string | null {
  const segments = relativePath.split("/");
  if (segments.length !== 2) return null;

  const [applicationId, storedName] = segments;
  if (!APPLICATION_ID_PATTERN.test(applicationId)) return null;
  if (!isSafeStoredName(storedName)) return null;

  const resolved = path.resolve(
    /* turbopackIgnore: true */ admissionUploadDir,
    path.basename(applicationId),
    path.basename(storedName),
  );

  const root = path.resolve(/* turbopackIgnore: true */ admissionUploadDir);
  if (!resolved.startsWith(`${root}${path.sep}`)) return null;

  return resolved;
}

/**
 * 파일 하나를 저장한다.
 *
 * `flag: "wx"` 로 이미 있는 파일을 덮어쓰지 않는다. UUID 라 부딪힐 일이 없지만,
 * 부딪힌다면 그건 사고이므로 조용히 덮어쓰는 것보다 실패하는 편이 낫다.
 */
export async function saveAdmissionFile(
  applicationId: string,
  storedName: string,
  bytes: Uint8Array,
): Promise<void> {
  const target = resolveAdmissionFilePath(
    admissionRelativePath(applicationId, storedName),
  );

  if (!target) {
    throw new Error("입학신청 파일 저장 경로를 만들 수 없습니다.");
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes, { flag: "wx" });
}

/**
 * 저장된 파일을 읽어 `data:` URL 로 만든다.
 *
 * **인쇄용 화면에서 서명 이미지를 넣을 때만 쓴다.** 서명은 수십 KB 짜리 PNG 라
 * HTML 에 그대로 심을 수 있고, 그러면 인쇄 화면이 이미지 주소를 따로 요청하지 않는다.
 * 요청이 없으면 그 주소가 브라우저 기록·캐시에 남지도 않는다.
 *
 * 파일이 없거나 경로가 형식에 맞지 않으면 null 이다. 화면은 그때 "서명 없음" 으로 그린다.
 * 용량이 큰 첨부서류에는 쓰지 않는다. (그쪽은 다운로드 라우트로 내보낸다)
 */
export async function readAdmissionFileAsDataUrl(
  relativePath: string,
  mimeType: string,
): Promise<string | null> {
  const target = resolveAdmissionFilePath(relativePath);
  if (!target) return null;

  try {
    // 경로는 위 `resolveAdmissionFilePath` 가 만든 것뿐이며 저장 루트 밖으로 나갈 수 없다.
    // 이 주석이 없으면 Turbopack 이 "어디를 읽을지 모른다" 며 프로젝트 전체를
    // 서버 번들에 포함시킨다. (`media/storage.ts` 와 같은 이유)
    const bytes = await readFile(/* turbopackIgnore: true */ target);
    return `data:${mimeType};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * 신청서 하나의 파일 디렉터리를 통째로 지운다.
 *
 * **저장 도중 실패했을 때 되돌리는 용도로만 쓴다.** 정상 신청서를 지우는 기능은 없다.
 * 경로 검사를 통과한 신청서 디렉터리에만 동작하며, 그 밖의 경로는 아무 일도 하지 않는다.
 * (wildcard 삭제를 하지 않는다)
 */
export async function removeAdmissionDirectory(
  applicationId: string,
): Promise<void> {
  if (!APPLICATION_ID_PATTERN.test(applicationId)) return;

  const root = path.resolve(/* turbopackIgnore: true */ admissionUploadDir);
  const target = path.resolve(root, path.basename(applicationId));

  if (!target.startsWith(`${root}${path.sep}`)) return;

  await rm(target, { recursive: true, force: true });
}
