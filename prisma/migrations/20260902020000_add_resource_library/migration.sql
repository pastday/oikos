-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('ADMISSION', 'GUIDE', 'ACADEMIC', 'OTHER');

-- CreateTable
CREATE TABLE "resource_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL DEFAULT 'OTHER',
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryKo" TEXT,
    "summaryEn" TEXT,
    "contentKo" TEXT,
    "contentEn" TEXT,
    "publishedAt" DATE NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_attachments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_posts_slug_key" ON "resource_posts"("slug");

-- CreateIndex
CREATE INDEX "resource_posts_isPublished_publishedAt_idx" ON "resource_posts"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "resource_posts_category_isPublished_publishedAt_idx" ON "resource_posts"("category", "isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "resource_attachments_postId_sortOrder_idx" ON "resource_attachments"("postId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "resource_attachments_postId_mediaId_key" ON "resource_attachments"("postId", "mediaId");

-- AddForeignKey
ALTER TABLE "resource_attachments" ADD CONSTRAINT "resource_attachments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "resource_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_attachments" ADD CONSTRAINT "resource_attachments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
