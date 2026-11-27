-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "avatar_id" TEXT,
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "is_undergraduate" BOOLEAN,
ADD COLUMN     "mood_reminder_time" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "name" TEXT,
ADD COLUMN     "notify_check_ins" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_messages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_mood" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_sessions" BOOLEAN NOT NULL DEFAULT true;
