import { randomUUID } from "node:crypto";
import path from "node:path";
import { isSafeStoredName } from "./url";

/**
 * 업로드 파일의 **저장 위치**.
 *
 * `node:` 모듈을 쓰므로 서버에서만 불러야 한다.
 * 주소 규칙처럼 양쪽에서 필요한 것은 `url.ts` 에 따로 두었다.
 *
 * ## 왜 프로젝트 밖에 저장하는가
 *
 * 개발 디렉터리와 운영 디렉터리가 같기 때문이다. (`/home/pastday/oikos`)
 * 업로드 파일을 소스 트리 안에 두면 `git clean` 한 번이나 배포 디렉터리 교체로
 * 운영 데이터가 사라진다. 소스와 완전히 분리해 두면 저장소를 어떻게 다루든 파일이 남는다.
 * 나중에 개발/운영 디렉터리를 분리해도 같은 파일을 그대로 공유할 수 있다.
 *
 * ## 서빙
 *
 * `public/` 밖이므로 Next.js 가 자동으로 서빙하지 않는다.
 * `src/app/media/[name]/route.ts` 가 읽어서 내보낸다.
 * nginx 는 이미 모든 요청을 Next.js 로 넘기고 있어 설정을 건드리지 않아도 된다.
 *
 * ## 운영 주의
 *
 * systemd 유닛에 `ProtectHome=read-only` 가 걸려 있다.
 * `ReadWritePaths` 에 업로드 디렉터리를 넣지 않으면 저장이 실패한다.
 * `deploy/systemd/oikos.service` 참고.
 */

/**
 * ## `turbopackIgnore` 주석에 대하여
 *
 * 아래 두 함수는 경로를 상수가 아니라 `uploadDir` 변수로 만든다.
 * Next 의 정적 분석은 이런 경우 "어디를 읽을지 모르니 프로젝트 전체를 배포에 포함하자" 로
 * 판단하고 경고한다. 그러면 `public/` 까지 서버 번들에 딸려 들어간다.
 *
 * 여기서는 **의도적으로** 프로젝트 밖의 고정된 디렉터리를 쓰는 것이므로
 * 추적이 필요 없다. 그래서 그 호출만 골라 추적에서 뺀다.
 * (Next 가 경고문에서 안내하는 해결책 그대로다)
 */

/** 기본 저장 위치. 프로젝트 디렉터리의 형제로 둔다. */
const DEFAULT_UPLOAD_DIR = path.resolve(process.cwd(), "../oikos-data/uploads");

/** 환경에 따라 바꿀 수 있게 열어 둔다. 값이 없으면 기본 위치를 쓴다. */
export const uploadDir = process.env.UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR;

/** 새 저장 파일명을 만든다. 확장자는 검증으로 알아낸 실제 형식에서 온다. */
export function createStoredName(extension: string): string {
  return `${randomUUID()}.${extension}`;
}

/**
 * 저장 파일명을 실제 파일 경로로 바꾼다.
 *
 * 이름을 먼저 검사하고 `basename` 으로 한 번 더 잘라낸다.
 * 둘 중 하나만 있어도 충분하지만, 파일시스템에 직접 닿는 곳이라 방어를 겹쳐 둔다.
 * 형식에 맞지 않으면 경로를 만들지 않고 null 을 돌려준다.
 */
export function resolveStoredPath(name: string): string | null {
  if (!isSafeStoredName(name)) return null;
  return path.join(/* turbopackIgnore: true */ uploadDir, path.basename(name));
}

/** 새로 저장할 파일의 전체 경로. 이름은 우리가 만든 것만 들어온다. */
export function storedFilePath(storedName: string): string {
  return path.join(/* turbopackIgnore: true */ uploadDir, storedName);
}
