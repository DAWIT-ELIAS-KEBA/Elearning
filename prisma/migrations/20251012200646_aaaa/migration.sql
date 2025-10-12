/*
  Warnings:

  - Added the required column `description` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExamQuestion" ALTER COLUMN "status" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Resource" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Roles" (
    "RoleID" TEXT NOT NULL,
    "RoleName" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("RoleID")
);

-- CreateTable
CREATE TABLE "public"."UserRoles" (
    "UserRoleID" TEXT NOT NULL,
    "UserID" TEXT NOT NULL,
    "RoleID" TEXT NOT NULL,
    "AssignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("UserRoleID")
);

-- CreateTable
CREATE TABLE "public"."Permissions" (
    "PermissionID" TEXT NOT NULL,
    "PermissionName" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("PermissionID")
);

-- CreateTable
CREATE TABLE "public"."RolePermissions" (
    "RolePermissionID" TEXT NOT NULL,
    "RoleID" TEXT NOT NULL,
    "PermissionID" TEXT NOT NULL,
    "AssignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("RolePermissionID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_RoleName_key" ON "public"."Roles"("RoleName");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_UserID_RoleID_key" ON "public"."UserRoles"("UserID", "RoleID");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_PermissionName_key" ON "public"."Permissions"("PermissionName");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissions_RoleID_PermissionID_key" ON "public"."RolePermissions"("RoleID", "PermissionID");

-- AddForeignKey
ALTER TABLE "public"."UserRoles" ADD CONSTRAINT "UserRoles_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "public"."Roles"("RoleID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRoles" ADD CONSTRAINT "UserRoles_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermissions" ADD CONSTRAINT "RolePermissions_PermissionID_fkey" FOREIGN KEY ("PermissionID") REFERENCES "public"."Permissions"("PermissionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermissions" ADD CONSTRAINT "RolePermissions_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "public"."Roles"("RoleID") ON DELETE CASCADE ON UPDATE CASCADE;
