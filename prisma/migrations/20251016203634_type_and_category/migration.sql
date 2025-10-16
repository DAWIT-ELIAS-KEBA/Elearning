-- AlterTable
ALTER TABLE "public"."Permissions" ADD COLUMN     "Category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "Type" TEXT NOT NULL DEFAULT '';
