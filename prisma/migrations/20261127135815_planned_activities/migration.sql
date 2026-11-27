-- CreateEnum
CREATE TYPE "activity_slot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateTable
CREATE TABLE "planned_activities" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "date" TEXT NOT NULL,
    "slot" "activity_slot" NOT NULL,
    "label" TEXT NOT NULL,
    "predicted" INTEGER,
    "session_id" INTEGER,
    "done_at" TIMESTAMP(3),
    "enjoy" INTEGER,
    "achieve" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planned_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "planned_activities_student_id_synced_at_idx" ON "planned_activities"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "planned_activities_student_id_date_idx" ON "planned_activities"("student_id", "date");

-- AddForeignKey
ALTER TABLE "planned_activities" ADD CONSTRAINT "planned_activities_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
