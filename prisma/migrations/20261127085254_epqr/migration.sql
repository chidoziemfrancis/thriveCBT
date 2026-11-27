-- CreateTable
CREATE TABLE "epqr_results" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "answers" BOOLEAN[],
    "psychoticism" INTEGER NOT NULL,
    "extraversion" INTEGER NOT NULL,
    "neuroticism" INTEGER NOT NULL,
    "lie" INTEGER NOT NULL,
    "wished_dead" BOOLEAN NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epqr_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "epqr_results_student_id_key" ON "epqr_results"("student_id");

-- AddForeignKey
ALTER TABLE "epqr_results" ADD CONSTRAINT "epqr_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
