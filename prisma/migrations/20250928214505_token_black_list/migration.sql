-- CreateTable
CREATE TABLE "public"."BlacklistedToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedToken_token_key" ON "public"."BlacklistedToken"("token");

-- CreateIndex
CREATE INDEX "BlacklistedToken_expireAt_idx" ON "public"."BlacklistedToken"("expireAt");
