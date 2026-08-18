/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `faculties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "photoUrl",
ADD COLUMN     "photoMediaId" TEXT;

-- AlterTable
ALTER TABLE "page_section_items" ADD COLUMN     "mediaId" TEXT;

-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN     "documentMediaId" TEXT,
ADD COLUMN     "mediaId" TEXT;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_documentMediaId_fkey" FOREIGN KEY ("documentMediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_section_items" ADD CONSTRAINT "page_section_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
