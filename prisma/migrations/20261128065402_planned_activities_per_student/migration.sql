/*
  Warnings:

  - The primary key for the `planned_activities` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "planned_activities" DROP CONSTRAINT "planned_activities_pkey",
ADD CONSTRAINT "planned_activities_pkey" PRIMARY KEY ("student_id", "id");
