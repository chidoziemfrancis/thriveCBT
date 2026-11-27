-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "prompt" TEXT,
    "text" TEXT,
    "mood" INTEGER,
    "session_id" INTEGER,
    "at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journal_entries_student_id_synced_at_idx" ON "journal_entries"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "journal_entries_student_id_at_idx" ON "journal_entries"("student_id", "at");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
