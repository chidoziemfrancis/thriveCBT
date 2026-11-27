-- CreateEnum
CREATE TYPE "email_code_purpose" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "purpose" "email_code_purpose" NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_codes_user_id_purpose_idx" ON "email_codes"("user_id", "purpose");

-- AddForeignKey
ALTER TABLE "email_codes" ADD CONSTRAINT "email_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
