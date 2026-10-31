import { readJson, writeJson } from '@/lib/storage';

import type { AssignmentMethod } from './assign';

const STORAGE_KEY = 'researcher_assignment';

// How and when the link was made is kept for the study's records, not just who.
export type AssignmentRecord = {
  researcherId: string;
  method: AssignmentMethod;
  assignedAt: string;
};

export function getAssignment(): AssignmentRecord | null {
  return readJson<AssignmentRecord | null>(STORAGE_KEY, null);
}

export function saveAssignment(researcherId: string, method: AssignmentMethod, now = new Date()) {
  writeJson(STORAGE_KEY, {
    researcherId,
    method,
    assignedAt: now.toISOString(),
  } satisfies AssignmentRecord);
}
