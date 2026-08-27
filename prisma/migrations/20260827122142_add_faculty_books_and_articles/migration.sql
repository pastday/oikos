-- CreateTable
CREATE TABLE "faculty_books" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "subtitleKo" TEXT,
    "subtitleEn" TEXT,
    "authorKo" TEXT,
    "authorEn" TEXT,
    "publisherKo" TEXT,
    "publisherEn" TEXT,
    "publishedAt" DATE,
    "isbn" TEXT,
    "descriptionKo" TEXT,
    "descriptionEn" TEXT,
    "externalUrl" TEXT,
    "coverMediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_articles" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryKo" TEXT,
    "summaryEn" TEXT,
    "publisherKo" TEXT,
    "publisherEn" TEXT,
    "publishedAt" DATE,
    "externalUrl" TEXT,
    "imageMediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faculty_books_facultyId_sortOrder_idx" ON "faculty_books"("facultyId", "sortOrder");

-- CreateIndex
CREATE INDEX "faculty_articles_facultyId_sortOrder_idx" ON "faculty_articles"("facultyId", "sortOrder");

-- AddForeignKey
ALTER TABLE "faculty_books" ADD CONSTRAINT "faculty_books_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_books" ADD CONSTRAINT "faculty_books_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_articles" ADD CONSTRAINT "faculty_articles_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_articles" ADD CONSTRAINT "faculty_articles_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
