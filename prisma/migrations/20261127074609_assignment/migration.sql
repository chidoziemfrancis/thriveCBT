-- CreateEnum
CREATE TYPE "assignment_method" AS ENUM ('INVITE', 'RANDOM');

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "researcher_id" UUID NOT NULL,
    "method" "assignment_method" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assignments_student_id_key" ON "assignments"("student_id");

-- CreateIndex
CREATE INDEX "assignments_researcher_id_idx" ON "assignments"("researcher_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_researcher_id_fkey" FOREIGN KEY ("researcher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
