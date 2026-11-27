import { z } from 'zod';

const isoDate = z.iso.date();

export const studentProfileSchema = z.object({
  name: z.string().nullable(),
  dateOfBirth: isoDate.nullable(),
  isUndergraduate: z.boolean().nullable(),
  avatarId: z.string().nullable(),
  studyWeek: z.number().int().min(1).max(8),
  joinedAt: z.iso.datetime(),
});
export type StudentProfileDto = z.infer<typeof studentProfileSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    dateOfBirth: isoDate.refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return date.getUTCFullYear() >= 1900 && date.getTime() < Date.now();
    }, 'Must be a real date in the past'),
    isUndergraduate: z.boolean(),
    avatarId: z.string().regex(/^avatar-\d{2}$/, 'Unknown avatar'),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Send at least one field');
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export const MOOD_REMINDER_TIMES = [
  '08:00',
  '12:00',
  '18:00',
  '21:00',
] as const;

export const preferencesSchema = z.object({
  notifySessions: z.boolean(),
  notifyMood: z.boolean(),
  moodReminderTime: z.enum(MOOD_REMINDER_TIMES),
  notifyMessages: z.boolean(),
  notifyCheckIns: z.boolean(),
});
export type PreferencesDto = z.infer<typeof preferencesSchema>;

export const updatePreferencesSchema = preferencesSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Send at least one field');
export type UpdatePreferencesBody = z.infer<typeof updatePreferencesSchema>;
