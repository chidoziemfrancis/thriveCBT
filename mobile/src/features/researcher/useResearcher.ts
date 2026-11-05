import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { researcherIdFor } from '@/features/auth/mockAccounts';
import { getUserSession } from '@/features/auth/userSession';

import { mockCaseload } from './caseload';
import { handledIds } from './alerts';
import { useAlertEvents } from './alertStore';
import { allCalls } from './schedule';
import { useSchedule } from './scheduleStore';
import { useResearcherSettings } from './settingsStore';

function read(now = new Date()) {
  const id = researcherIdFor(getUserSession().email);
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === id) ?? null;
  // Only Grace has mock students; anyone else starts empty until the backend exists.
  const caseload = id === 'r-grace' ? mockCaseload(now) : { students: [], calls: [] };
  return { researcher, ...caseload, now };
}

/** Rebuilt on focus so "today" stays current. */
export function useResearcher() {
  const [state, setState] = useState(() => read());
  useFocusEffect(useCallback(() => setState(read()), []));
  const { bookings, cancelled } = useSchedule();
  const alertEvents = useAlertEvents();
  const settings = useResearcherSettings();
  const researcher = state.researcher && {
    ...state.researcher,
    name: settings.name ?? state.researcher.name,
    bio: settings.bio ?? state.researcher.bio,
    capacity: settings.capacity ?? state.researcher.capacity,
    accepting: settings.accepting ?? state.researcher.accepting,
  };
  return {
    ...state,
    researcher,
    settings,
    calls: allCalls(state.calls, bookings, cancelled),
    alertEvents,
    handled: handledIds(alertEvents),
  };
}
