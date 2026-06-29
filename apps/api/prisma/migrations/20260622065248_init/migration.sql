-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastActive" TEXT NOT NULL DEFAULT 'Đang hoạt động',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledClass" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReport" (
    "id" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "presentStudents" INTEGER NOT NULL,
    "totalStudents" INTEGER NOT NULL,
    "avgDurationMins" INTEGER NOT NULL,
    "avgConnectionQuality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReportDetail" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "presentTimeMins" INTEGER NOT NULL,
    "totalTimeMins" INTEGER NOT NULL,
    "pct" DOUBLE PRECISION NOT NULL,
    "ping" DOUBLE PRECISION NOT NULL,
    "jitter" DOUBLE PRECISION NOT NULL,
    "loss" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SessionReportDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SessionReportDetail" ADD CONSTRAINT "SessionReportDetail_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SessionReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
