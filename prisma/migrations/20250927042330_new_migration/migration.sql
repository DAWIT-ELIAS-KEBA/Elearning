-- AlterTable
ALTER TABLE "public"."Resource" ADD COLUMN     "chapter" INTEGER,
ADD COLUMN     "lesson" INTEGER;

-- CreateTable
CREATE TABLE "public"."ExamComment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ExamComment" ADD CONSTRAINT "ExamComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamComment" ADD CONSTRAINT "ExamComment_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."ExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
