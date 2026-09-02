-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('NOTICE', 'EVENT', 'ACADEMIC', 'MEDIA', 'OTHER');

-- CreateTable
CREATE TABLE "news_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryKo" TEXT,
    "summaryEn" TEXT,
    "contentKo" TEXT NOT NULL,
    "contentEn" TEXT,
    "category" "NewsCategory" NOT NULL DEFAULT 'NOTICE',
    "publishedAt" DATE NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_attachments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_posts_slug_key" ON "news_posts"("slug");

-- CreateIndex
CREATE INDEX "news_posts_isPublished_publishedAt_idx" ON "news_posts"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "news_attachments_postId_sortOrder_idx" ON "news_attachments"("postId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "news_attachments_postId_mediaId_key" ON "news_attachments"("postId", "mediaId");

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_attachments" ADD CONSTRAINT "news_attachments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_attachments" ADD CONSTRAINT "news_attachments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
