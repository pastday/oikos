-- CreateEnum
CREATE TYPE "NewsLinkType" AS ENUM ('ARTICLE', 'VIDEO');

-- CreateTable
CREATE TABLE "news_links" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "NewsLinkType" NOT NULL,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_links_postId_sortOrder_idx" ON "news_links"("postId", "sortOrder");

-- AddForeignKey
ALTER TABLE "news_links" ADD CONSTRAINT "news_links_postId_fkey" FOREIGN KEY ("postId") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
