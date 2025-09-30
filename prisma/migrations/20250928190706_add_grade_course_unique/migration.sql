/*
  Warnings:

  - A unique constraint covering the columns `[grade_id,course_id]` on the table `GradeCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GradeCourse_grade_id_course_id_key" ON "public"."GradeCourse"("grade_id", "course_id");
