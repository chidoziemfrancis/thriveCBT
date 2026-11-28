import { readJson, removeKey, writeJson } from '@/lib/storage';
import { onStudentChange } from '@/lib/sync';

import type { Assignment, ResearcherCard } from '../types/assignment.types';

// A new key: the old one held mock researchers that no longer exist.
const STORAGE_KEY = 'researcher_match';

/** The phone's copy of the match, written only from the server's answer. */
export function getAssignment(): Assignment | null {
  const saved = readJson<Assignment | null>(STORAGE_KEY, null);
  return saved?.researcher ? saved : null;
}

export function getMyResearcher(): ResearcherCard | undefined {
  return getAssignment()?.researcher;
}

export function saveAssignmentOnPhone(assignment: Assignment) {
  writeJson(STORAGE_KEY, assignment);
}

/** The server says this student has no researcher (yet, or any more). */
export function forgetAssignmentOnPhone() {
  removeKey(STORAGE_KEY);
}

onStudentChange(forgetAssignmentOnPhone);
