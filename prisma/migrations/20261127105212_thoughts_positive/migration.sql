-- CreateEnum
CREATE TYPE "positive_kind" AS ENUM ('STRENGTH', 'WIN', 'KIND', 'OTHER');

-- CreateTable
CREATE TABLE "positive_entries" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "kind" "positive_kind" NOT NULL,
    "text" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positive_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_records" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "situation" TEXT,
    "thought" TEXT,
    "feeling" TEXT[],
    "action" TEXT,
    "traps" TEXT[],
    "session_id" INTEGER,
    "balanced" TEXT,
    "belief_before" INTEGER,
    "belief_after" INTEGER,
    "at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thought_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "positive_entries_student_id_synced_at_idx" ON "positive_entries"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "thought_records_student_id_synced_at_idx" ON "thought_records"("student_id", "synced_at");

-- AddForeignKey
ALTER TABLE "positive_entries" ADD CONSTRAINT "positive_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_records" ADD CONSTRAINT "thought_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
