-- CreateEnum
CREATE TYPE "alert_kind" AS ENUM ('QUESTION_9', 'EPQR_WISH', 'RISK_WORDS', 'PHQ9_RISE', 'SEVERE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "phq9_kind" AS ENUM ('BASELINE', 'FINAL');

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "researcher_id" UUID,
    "kind" "alert_kind" NOT NULL,
    "urgent" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "quote" TEXT,
    "detail" TEXT,
    "source_id" TEXT NOT NULL,
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phq9_results" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "kind" "phq9_kind" NOT NULL,
    "answers" INTEGER[],
    "score" INTEGER NOT NULL,
    "item_9" INTEGER NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phq9_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alerts_researcher_id_raised_at_idx" ON "alerts"("researcher_id", "raised_at");

-- CreateIndex
CREATE INDEX "alerts_student_id_idx" ON "alerts"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_kind_source_id_key" ON "alerts"("kind", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "phq9_results_student_id_kind_key" ON "phq9_results"("student_id", "kind");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_researcher_id_fkey" FOREIGN KEY ("researcher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phq9_results" ADD CONSTRAINT "phq9_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
