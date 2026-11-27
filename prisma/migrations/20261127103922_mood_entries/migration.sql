-- CreateTable
CREATE TABLE "mood_entries" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "mood" INTEGER NOT NULL,
    "note" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mood_entries_student_id_synced_at_idx" ON "mood_entries"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "mood_entries_student_id_at_idx" ON "mood_entries"("student_id", "at");

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
