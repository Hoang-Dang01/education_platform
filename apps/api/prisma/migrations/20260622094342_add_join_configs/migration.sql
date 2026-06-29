-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "earlyJoinMins" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "lateJoinMins" INTEGER;
