import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { researcherIdFor } from '@/features/auth/mockAccounts';
import { getUserSession } from '@/features/auth/userSession';

import { mockCaseload } from './caseload';

function read(now = new Date()) {
  const id = researcherIdFor(getUserSession().email);
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === id) ?? null;
  // Only Grace has mock students; anyone else starts empty until the backend exists.
  const caseload = id === 'r-grace' ? mockCaseload(now) : { students: [], calls: [] };
  return { researcher, ...caseload, now };
}

/** The signed-in researcher and their students, rebuilt on focus so "today" stays current. */
export function useResearcher() {
  const [state, setState] = useState(() => read());
  useFocusEffect(useCallback(() => setState(read()), []));
  return state;
}
