-- CreateTable
CREATE TABLE "crisis_plan_progress" (
    "student_id" UUID NOT NULL,
    "parts_filled" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crisis_plan_progress_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "stress_entries" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "situation" TEXT,
    "level" INTEGER,
    "helped" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stress_entries_pkey" PRIMARY KEY ("student_id","id")
);

-- CreateTable
CREATE TABLE "toolkit_items" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "card_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toolkit_items_pkey" PRIMARY KEY ("student_id","id")
);

-- CreateTable
CREATE TABLE "tool_uses" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "card_id" TEXT NOT NULL,
    "helped" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_uses_pkey" PRIMARY KEY ("student_id","id")
);

-- CreateIndex
CREATE INDEX "stress_entries_student_id_synced_at_idx" ON "stress_entries"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "toolkit_items_student_id_synced_at_idx" ON "toolkit_items"("student_id", "synced_at");

-- CreateIndex
CREATE INDEX "tool_uses_student_id_synced_at_idx" ON "tool_uses"("student_id", "synced_at");

-- AddForeignKey
ALTER TABLE "crisis_plan_progress" ADD CONSTRAINT "crisis_plan_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stress_entries" ADD CONSTRAINT "stress_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toolkit_items" ADD CONSTRAINT "toolkit_items_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_uses" ADD CONSTRAINT "tool_uses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
