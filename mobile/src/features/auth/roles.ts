import type { Href } from 'expo-router';

export type Role = 'student' | 'researcher';

const HOME_BY_ROLE: Record<Role, Href> = {
  student: '/dashboard',
  researcher: '/researcher',
};

export function homeFor(role: Role): Href {
  return HOME_BY_ROLE[role];
}
