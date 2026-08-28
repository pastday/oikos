import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * 주민등록번호 암호화. (18단계)
 *
 * ## 왜 해시가 아니라 암호화인가
 *
 * 입학원서 PDF 에 주민등록번호 원문이 들어가야 한다. 해시는 되돌릴 수 없으므로
 * bcrypt·SHA 계열을 쓸 수 없고 **복호화 가능한 암호화**가 필요하다.
 * 비밀번호(`AdminUser.passwordHash`)와는 요구사항이 정반대다.
 *
 * ## 왜 AES-256-GCM 인가
 *
 * GCM 은 **인증 암호화**라서 암호문이 변조되면 복호화가 실패한다.
 * CBC 에는 그 성질이 없어 조용히 엉뚱한 값이 나올 수 있다.
 * `node:crypto` 에 들어 있어 새 의존성이 필요 없다.
 *
 * ## 왜 DB(pgcrypto) 가 아니라 애플리케이션에서 하는가
 *
 * DB 덤프나 백업만 유출돼도 키가 없으면 읽을 수 없게 하려는 것이다.
 * 앱이 DB 계정 하나로 접속하는 구조에서 키를 DB 안에 두면 의미가 반감된다.
 *
 * ## 이 파일 밖으로 평문이 나가는 곳
 *
 * **인쇄용 화면(`/admin/admissions/[id]/print`) 한 곳뿐이다.**
 * 관리자 목록은 컬럼을 조회조차 하지 않고, 상세는 `maskResidentNumber()` 결과만 쓴다.
 * 아래 함수들은 실패해도 **입력값을 오류 메시지나 로그에 넣지 않는다.**
 */

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
/** GCM 권장 nonce 길이. 12바이트가 표준이며 매번 새로 만든다. */
const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * 저장 형식의 버전. `v1:<iv>:<tag>:<ciphertext>` (구분자를 뺀 나머지는 전부 base64)
 *
 * 나중에 키를 교체하거나 알고리즘을 바꿔야 할 때, 기존 값을 한 번에 재암호화하지 않고도
 * 어느 규칙으로 만든 값인지 구분할 수 있게 접두사를 붙여 둔다.
 */
const FORMAT_VERSION = "v1";

/** 주민등록번호는 하이픈을 뺀 13자리 숫자다. */
const RESIDENT_NUMBER_DIGITS = 13;

let cachedKey: Buffer | null = null;

/**
 * 환경변수에서 키를 읽는다.
 *
 * 키가 없거나 길이가 틀리면 **던진다.** 조용히 평문으로 저장하는 사고를 막기 위해서다.
 * 값 자체는 오류 메시지에 넣지 않는다.
 */
function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ADMISSION_ENCRYPTION_KEY?.trim();

  if (!raw) {
    throw new Error(
      "ADMISSION_ENCRYPTION_KEY 환경변수가 설정되어 있지 않습니다. (.env.example 참고)",
    );
  }

  const key = Buffer.from(raw, "base64");

  if (key.length !== KEY_BYTES) {
    throw new Error(
      `ADMISSION_ENCRYPTION_KEY 는 base64 로 인코딩된 ${KEY_BYTES}바이트여야 합니다. ` +
        "생성: openssl rand -base64 32",
    );
  }

  cachedKey = key;
  return key;
}

/**
 * 키 설정이 올바른지만 확인한다. 값을 돌려주지 않는다.
 *
 * 신청 저장을 시작하기 전에 불러서, 파일까지 다 쓴 뒤에 키 문제로 실패하는 일을 막는다.
 */
export function assertEncryptionKeyConfigured(): void {
  getKey();
}

/**
 * 입력에서 숫자만 남긴다. 하이픈·공백을 어떻게 넣든 같은 값으로 저장된다.
 * 13자리가 아니면 null. (검증은 호출하는 쪽에서 오류 코드로 바꾼다)
 */
export function normalizeResidentNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  return digits.length === RESIDENT_NUMBER_DIGITS ? digits : null;
}

/** 13자리 숫자를 `900101-1234567` 형태로 만든다. 인쇄 화면에서만 쓴다. */
export function formatResidentNumber(digits: string): string {
  if (digits.length !== RESIDENT_NUMBER_DIGITS) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

/**
 * 관리자 화면에 보여줄 마스킹 값. 예: `900101-1******`
 *
 * 뒷자리 첫 글자(성별 구분)까지만 남긴다. 종이 원서를 대조할 때 필요한 최소한이며,
 * 이것만으로는 사람을 특정할 수 없다.
 */
export function maskResidentNumber(digits: string): string {
  if (digits.length !== RESIDENT_NUMBER_DIGITS) return "******-*******";
  return `${digits.slice(0, 6)}-${digits.slice(6, 7)}******`;
}

/**
 * 암호문에서 곧바로 마스킹 값을 만든다.
 *
 * 관리자 상세 화면이 쓰는 함수다. 복호화한 평문이 화면 렌더 트리로 흘러가지 않도록
 * **이 함수 안에서 마스킹까지 끝낸다.**
 * 복호화에 실패하면(키 교체·값 손상) 화면을 깨뜨리지 않고 고정 마스크를 돌려준다.
 */
export function maskEncryptedResidentNumber(encrypted: string): string {
  try {
    return maskResidentNumber(decryptResidentNumber(encrypted));
  } catch {
    return "******-*******";
  }
}

/**
 * 13자리 숫자를 암호문 문자열로 바꾼다.
 *
 * 같은 값을 두 번 넣어도 IV 가 매번 달라 결과가 달라진다.
 * 따라서 이 값으로는 검색·중복확인을 할 수 없다. (의도된 성질이다)
 */
export function encryptResidentNumber(digits: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(digits, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * 암호문을 13자리 숫자로 되돌린다.
 *
 * 형식이 맞지 않거나 변조되었으면 던진다. **오류에 암호문이나 평문을 담지 않는다.**
 */
export function decryptResidentNumber(stored: string): string {
  const parts = stored.split(":");

  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new Error("주민등록번호 암호문 형식이 올바르지 않습니다.");
  }

  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ciphertext = Buffer.from(parts[3], "base64");

  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error("주민등록번호 암호문 형식이 올바르지 않습니다.");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  // 변조된 값이면 final() 에서 던진다. GCM 을 쓰는 이유가 이것이다.
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
