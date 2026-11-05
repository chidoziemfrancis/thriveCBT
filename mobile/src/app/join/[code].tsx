import { Redirect, useLocalSearchParams } from 'expo-router';

import { setUserSession } from '@/features/auth/userSession';

// An invite link only carries the code; the sign-up flow picks it up from the session.
export default function JoinWithCode() {
  const { code } = useLocalSearchParams<{ code: string }>();
  if (code) setUserSession({ inviteCode: code.toUpperCase() });
  return <Redirect href="/" />;
}
