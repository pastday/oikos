import "dotenv/config";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";

/**
 * 초기 관리자(SUPER_ADMIN) 계정 생성 스크립트.
 *
 *   npm run admin:create
 *
 * 회원가입 화면을 만들지 않기 때문에 최초 관리자는 이 스크립트로만 만든다.
 * 비밀번호는 코드에 하드코딩하지 않고 `.env` 의 환경변수에서 읽는다. (CLAUDE.md 19항)
 *
 *   SEED_ADMIN_EMAIL     로그인 이메일
 *   SEED_ADMIN_NAME      화면에 표시할 이름
 *   SEED_ADMIN_PASSWORD  초기 비밀번호
 *
 * 안전장치
 *  - 같은 이메일의 계정이 **이미 있으면 아무것도 하지 않는다.** 실수로 운영 계정의
 *    비밀번호를 덮어쓰는 사고를 막기 위해 upsert 를 쓰지 않는다.
 *    비밀번호를 바꿔야 하면 `--force-password` 를 명시적으로 붙여야 한다.
 *  - 비밀번호 평문은 화면에도 로그에도 출력하지 않는다.
 */

/** bcrypt cost. 순수 JS 구현(bcryptjs)에서 해시 1회에 약 0.2초 걸린다. */
const BCRYPT_COST = 12;

const envSchema = z.object({
  SEED_ADMIN_EMAIL: z
    .string("SEED_ADMIN_EMAIL 이 설정되어 있지 않습니다.")
    .trim()
    .toLowerCase()
    .pipe(z.email("SEED_ADMIN_EMAIL 이 올바른 이메일 형식이 아닙니다.")),
  SEED_ADMIN_NAME: z
    .string("SEED_ADMIN_NAME 이 설정되어 있지 않습니다.")
    .trim()
    .min(1, "SEED_ADMIN_NAME 이 비어 있습니다.")
    .max(60, "SEED_ADMIN_NAME 이 너무 깁니다."),
  SEED_ADMIN_PASSWORD: z
    .string("SEED_ADMIN_PASSWORD 가 설정되어 있지 않습니다.")
    .min(12, "SEED_ADMIN_PASSWORD 는 12자 이상이어야 합니다.")
    .max(200, "SEED_ADMIN_PASSWORD 가 너무 깁니다."),
});

async function main(): Promise<void> {
  const forcePassword = process.argv.includes("--force-password");

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("환경변수를 확인해 주세요:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.message}`);
    }
    console.error("\n.env 에 값을 넣은 뒤 다시 실행하세요. (.env 는 Git 에 올리지 않습니다)");
    process.exitCode = 1;
    return;
  }

  const {
    SEED_ADMIN_EMAIL: email,
    SEED_ADMIN_NAME: name,
    SEED_ADMIN_PASSWORD: password,
  } = parsed.data;

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, name: true, role: true, isActive: true },
  });

  if (existing && !forcePassword) {
    console.log(`이미 같은 이메일의 관리자 계정이 있습니다. (${email})`);
    console.log(
      `  이름: ${existing.name} / 권한: ${existing.role} / 활성: ${existing.isActive}`,
    );
    console.log(
      "\n비밀번호를 덮어쓰려면 --force-password 를 붙여 실행하세요:\n" +
        "  npm run admin:create -- --force-password",
    );
    return;
  }

  const passwordHash = await hash(password, BCRYPT_COST);

  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: { name, passwordHash, isActive: true },
    });
    console.log(`관리자 비밀번호를 변경했습니다. (${email})`);
    return;
  }

  const created = await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    select: { email: true, name: true, role: true },
  });

  console.log("관리자 계정을 만들었습니다.");
  console.log(
    `  이메일: ${created.email} / 이름: ${created.name} / 권한: ${created.role}`,
  );
}

main()
  .catch((error: unknown) => {
    // 비밀번호가 섞여 들어갈 수 있는 값은 출력하지 않는다.
    console.error(
      "관리자 계정 생성에 실패했습니다:",
      error instanceof Error ? error.message : "알 수 없는 오류",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
