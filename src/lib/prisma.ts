import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js 개발환경에서는 hot reload 마다 모듈이 다시 평가되어
// PrismaClient 인스턴스가 계속 늘어나고 DB connection 이 고갈될 수 있다.
// 이를 막기 위해 globalThis 에 인스턴스를 보관하는 일반적인 싱글턴 방식을 사용한다.
// 프로덕션에서는 모듈이 한 번만 평가되므로 globalThis 에 담지 않는다.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
  }

  // Prisma 7 부터는 driver adapter 사용이 필수이다. PostgreSQL 용 어댑터를 연결한다.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
