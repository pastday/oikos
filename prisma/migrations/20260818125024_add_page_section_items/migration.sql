-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN     "highlightEn" TEXT,
ADD COLUMN     "highlightKo" TEXT,
ADD COLUMN     "noteEn" TEXT,
ADD COLUMN     "noteKo" TEXT,
ADD COLUMN     "subtitleEn" TEXT,
ADD COLUMN     "subtitleKo" TEXT;

-- CreateTable
CREATE TABLE "page_section_items" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "labelKo" TEXT,
    "labelEn" TEXT,
    "valueKo" TEXT,
    "valueEn" TEXT,
    "variant" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_section_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_section_items_sectionId_sortOrder_idx" ON "page_section_items"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "page_section_items" ADD CONSTRAINT "page_section_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
