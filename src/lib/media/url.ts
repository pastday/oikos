/**
 * 업로드 파일의 **공개 URL 규칙**.
 *
 * 파일시스템을 건드리지 않는 순수 함수만 둔다. 그래서 서버·클라이언트 어디서든 쓸 수 있다.
 * 실제 저장 경로를 다루는 코드는 `storage.ts` 에 따로 있다. (`node:` 모듈을 쓴다)
 *
 * 두 파일을 나눈 이유는 관심사 분리이기도 하지만, 클라이언트에서 닿는 모듈 그래프에
 * Node 전용 모듈이 섞이지 않게 하려는 목적이 크다.
 */

/** 공개 URL 의 접두사. 이 값이 바뀌면 기존 `Media.path` 도 함께 고쳐야 한다. */
const URL_PREFIX = "/media";

/**
 * 저장 파일명에 허용하는 형태.
 *
 * 우리가 만든 이름만 통과한다. (UUID + 우리가 정한 확장자)
 * 사용자가 올린 원본 파일명은 저장 경로에 전혀 쓰이지 않으므로
 * `../` 같은 경로 조작이 애초에 들어올 자리가 없고,
 * 이 검사는 그 사실을 파일을 읽는 시점에 한 번 더 확인하는 안전망이다.
 */
const STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|pdf)$/;

export function isSafeStoredName(name: string): boolean {
  return STORED_NAME_PATTERN.test(name);
}

/** 저장 파일명을 브라우저가 쓸 주소로 바꾼다. */
export function mediaUrl(storedName: string): string {
  return `${URL_PREFIX}/${storedName}`;
}

/** 공개 URL 에서 저장 파일명을 되찾는다. 우리가 만든 URL 이 아니면 null. */
export function storedNameFromUrl(url: string): string | null {
  const prefix = `${URL_PREFIX}/`;
  if (!url.startsWith(prefix)) return null;

  const name = url.slice(prefix.length);
  return isSafeStoredName(name) ? name : null;
}
