/*
  Warnings:

  - Added the required column `chapter` to the `ExamQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExamQuestion" ADD COLUMN     "chapter" INTEGER NOT NULL;
