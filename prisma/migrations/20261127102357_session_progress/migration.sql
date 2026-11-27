-- CreateTable
CREATE TABLE "session_progress" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "session_id" INTEGER NOT NULL,
    "done" TEXT[],
    "answers" JSONB NOT NULL DEFAULT '{}',
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_progress_student_id_synced_at_idx" ON "session_progress"("student_id", "synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "session_progress_student_id_session_id_key" ON "session_progress"("student_id", "session_id");

-- AddForeignKey
ALTER TABLE "session_progress" ADD CONSTRAINT "session_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
