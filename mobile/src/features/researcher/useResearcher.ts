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

function read(now = new Date()) {
  const id = researcherIdFor(getUserSession().email);
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === id) ?? null;
  // Only Grace has mock students; anyone else starts empty until the backend exists.
  const caseload = id === 'r-grace' ? mockCaseload(now) : { students: [], calls: [] };
  return { researcher, ...caseload, now };
}

/**
 * The signed-in researcher, their students and every call, including ones they've booked or
 * cancelled, and which alerts are handled. The caseload is rebuilt on focus so "today" stays
 * current; bookings and alert actions are live.
 */
export function useResearcher() {
  const [state, setState] = useState(() => read());
  useFocusEffect(useCallback(() => setState(read()), []));
  const { bookings, cancelled } = useSchedule();
  const alertEvents = useAlertEvents();
  return {
    ...state,
    calls: allCalls(state.calls, bookings, cancelled),
    alertEvents,
    handled: handledIds(alertEvents),
  };
}
