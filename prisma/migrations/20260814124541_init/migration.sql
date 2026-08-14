-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "FacultyType" AS ENUM ('CHIEF_PROFESSOR', 'PROFESSOR', 'VISITING_PROFESSOR');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('MBA', 'DBA');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('MAJOR', 'COMMON', 'CHAPEL', 'OTHER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "titleKo" TEXT,
    "titleEn" TEXT,
    "bodyKo" TEXT,
    "bodyEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "type" "FacultyType" NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT,
    "titleKo" TEXT,
    "titleEn" TEXT,
    "majorKo" TEXT,
    "majorEn" TEXT,
    "careerKo" TEXT,
    "careerEn" TEXT,
    "lectureFieldsKo" TEXT,
    "lectureFieldsEn" TEXT,
    "photoUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionKo" TEXT,
    "descriptionEn" TEXT,
    "durationSemesters" INTEGER,
    "totalCredits" INTEGER,
    "majorCredits" INTEGER,
    "commonCredits" INTEGER,
    "chapelCourses" INTEGER,
    "classMethodKo" TEXT,
    "classMethodEn" TEXT,
    "graduationRequirementsKo" TEXT,
    "graduationRequirementsEn" TEXT,
    "careerKo" TEXT,
    "careerEn" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "credits" INTEGER,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionKo" TEXT,
    "descriptionEn" TEXT,
    "category" "CourseCategory" NOT NULL DEFAULT 'MAJOR',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "questionKo" TEXT NOT NULL,
    "questionEn" TEXT,
    "answerKo" TEXT NOT NULL,
    "answerEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interestedProgram" "ProgramType",
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seminar_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredSession" TEXT,
    "attendeeCount" INTEGER NOT NULL DEFAULT 1,
    "memo" TEXT,
    "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "altKo" TEXT,
    "altEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "valueKo" TEXT,
    "valueEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_pageKey_sectionKey_key" ON "page_sections"("pageKey", "sectionKey");

-- CreateIndex
CREATE INDEX "faculties_type_sortOrder_idx" ON "faculties"("type", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "programs_type_key" ON "programs"("type");

-- CreateIndex
CREATE INDEX "courses_programId_semester_sortOrder_idx" ON "courses"("programId", "semester", "sortOrder");

-- CreateIndex
CREATE INDEX "faqs_sortOrder_idx" ON "faqs"("sortOrder");

-- CreateIndex
CREATE INDEX "consultations_status_createdAt_idx" ON "consultations"("status", "createdAt");

-- CreateIndex
CREATE INDEX "seminar_applications_status_createdAt_idx" ON "seminar_applications"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "media_storedName_key" ON "media"("storedName");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
