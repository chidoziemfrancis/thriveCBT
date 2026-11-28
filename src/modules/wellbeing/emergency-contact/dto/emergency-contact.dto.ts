import { z } from 'zod';

import { clientUpdatedAt } from '../../../../shared/sync/sync.dto.js';

export const emergencyContactContentSchema = z.object({
  name: z.string().trim().min(1).max(80),
  relationship: z.string().trim().max(60),
  phone: z.string().trim().min(3).max(30),
});
export type EmergencyContactContent = z.infer<
  typeof emergencyContactContentSchema
>;

export const saveEmergencyContactSchema = emergencyContactContentSchema.extend({
  updatedAt: clientUpdatedAt,
});
export type SaveEmergencyContact = z.infer<typeof saveEmergencyContactSchema>;

// A removed contact comes back as a marker with empty details.
export const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});
export type EmergencyContactDto = z.infer<typeof emergencyContactSchema>;

export const emergencyContactListSchema = z.object({
  items: z.array(emergencyContactSchema).max(1),
  serverTime: z.iso.datetime(),
});
export type EmergencyContactList = z.infer<typeof emergencyContactListSchema>;
