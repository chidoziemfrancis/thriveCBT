-- CreateTable
CREATE TABLE "homework_ticks" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "session_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homework_ticks_pkey" PRIMARY KEY ("student_id","id")
);

-- CreateIndex
CREATE INDEX "homework_ticks_student_id_synced_at_idx" ON "homework_ticks"("student_id", "synced_at");

-- AddForeignKey
ALTER TABLE "homework_ticks" ADD CONSTRAINT "homework_ticks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
