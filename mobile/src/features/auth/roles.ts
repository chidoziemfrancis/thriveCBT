import type { Href } from 'expo-router';

import type { Role } from './types/auth.types';

export type { Role };

const HOME_BY_ROLE: Record<Role, Href> = {
  student: '/dashboard',
  researcher: '/researcher',
  lead: '/researcher',
};

export function homeFor(role: Role): Href {
  return HOME_BY_ROLE[role];
}
