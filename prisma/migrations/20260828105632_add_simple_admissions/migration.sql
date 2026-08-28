-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('NEW', 'IN_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AdmissionTerm" AS ENUM ('SPRING', 'FALL');

-- CreateEnum
CREATE TYPE "AdmissionGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AdmissionMaritalStatus" AS ENUM ('SINGLE', 'MARRIED');

-- CreateEnum
CREATE TYPE "AdmissionFileType" AS ENUM ('GRADUATION_CERTIFICATE', 'TRANSCRIPT', 'PASSPORT', 'PHOTO', 'INSURANCE', 'PHONE_BILL', 'ELECTRIC_BILL', 'RENT_BILL', 'RECOMMENDATION', 'SIGNATURE_INSTITUTIONAL_PURPOSE', 'SIGNATURE_CODE_OF_CONDUCT', 'SIGNATURE_STATEMENT_OF_FAITH', 'GENERATED_PDF');

-- CreateTable
CREATE TABLE "admission_applications" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'NEW',
    "program" "ProgramType" NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "admissionTerm" "AdmissionTerm" NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "residentNumberEncrypted" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "gender" "AdmissionGender" NOT NULL,
    "nationality" TEXT NOT NULL,
    "birthplace" TEXT NOT NULL,
    "addressKo" TEXT NOT NULL,
    "addressEn" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usCitizen" BOOLEAN NOT NULL,
    "driversLicenseNumber" TEXT,
    "driversLicenseIssuedAt" TEXT,
    "emergencyName" TEXT NOT NULL,
    "emergencyRelationship" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "emergencyAddress" TEXT NOT NULL,
    "maritalStatus" "AdmissionMaritalStatus",
    "personalIntroduction" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "studyPlan" TEXT NOT NULL,
    "institutionalPurposeAgreed" BOOLEAN NOT NULL DEFAULT false,
    "institutionalPurposeSignedName" TEXT,
    "institutionalPurposeSignedAt" TIMESTAMP(3),
    "codeOfConductAgreed" BOOLEAN NOT NULL DEFAULT false,
    "codeOfConductSignedName" TEXT,
    "codeOfConductSignedAt" TIMESTAMP(3),
    "statementOfFaithAgreed" BOOLEAN NOT NULL DEFAULT false,
    "statementOfFaithSignedName" TEXT,
    "statementOfFaithSignedAt" TIMESTAMP(3),
    "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "adminMemo" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_educations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolAddress" TEXT,
    "period" TEXT,
    "degreeName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_careers" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "period" TEXT,
    "position" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_files" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "AdmissionFileType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_applicationNo_key" ON "admission_applications"("applicationNo");

-- CreateIndex
CREATE INDEX "admission_applications_status_submittedAt_idx" ON "admission_applications"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "admission_applications_program_status_idx" ON "admission_applications"("program", "status");

-- CreateIndex
CREATE INDEX "admission_educations_applicationId_sortOrder_idx" ON "admission_educations"("applicationId", "sortOrder");

-- CreateIndex
CREATE INDEX "admission_careers_applicationId_sortOrder_idx" ON "admission_careers"("applicationId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "admission_files_storedName_key" ON "admission_files"("storedName");

-- CreateIndex
CREATE INDEX "admission_files_applicationId_type_idx" ON "admission_files"("applicationId", "type");

-- AddForeignKey
ALTER TABLE "admission_educations" ADD CONSTRAINT "admission_educations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "admission_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_careers" ADD CONSTRAINT "admission_careers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "admission_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_files" ADD CONSTRAINT "admission_files_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "admission_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
