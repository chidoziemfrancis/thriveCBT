import { readJson, writeJson } from '@/lib/storage';

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
