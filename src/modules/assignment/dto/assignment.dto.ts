import { z } from 'zod';

export const inviteCodeSchema = z
  .string()
  .transform((code) => code.replace(/\s/g, '').toUpperCase())
  .pipe(
    z
      .string()
      .regex(/^[A-Z0-9]{4,12}$/, 'Enter the code your researcher gave you'),
  );

export const assignSchema = z.object({
  inviteCode: inviteCodeSchema.optional(),
});
export type AssignBody = z.infer<typeof assignSchema>;

export const researcherCardSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  title: z.string().nullable(),
  bio: z.string().nullable(),
});
export type ResearcherCard = z.infer<typeof researcherCardSchema>;

export const assignmentSchema = z.object({
  researcher: researcherCardSchema,
  method: z.enum(['invite', 'random']),
  assignedAt: z.iso.datetime(),
});
export type AssignmentDto = z.infer<typeof assignmentSchema>;
